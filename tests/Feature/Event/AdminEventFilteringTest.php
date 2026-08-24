<?php

use App\Core\Event\Actions\GetAdminEventsAction;
use App\Core\Event\Actions\UpdateEventAction;
use App\Core\Event\Dto\AdminEventFiltersDto;
use App\Core\Event\Dto\StoreEventDto;
use App\Core\Event\Dto\UpdateEventDto;
use App\External\Api\Request\Event\IndexEventRequest;
use App\External\Api\Request\Event\StoreEventRequest;
use App\External\Api\Request\Event\UpdateEventRequest;
use App\External\Web\Controllers\Event\Admin\IndexEventController;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Support\Header;

beforeEach(function () {
    Schema::create('events', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->index();
        $table->string('title');
        $table->text('description');
        $table->string('type', 32);
        $table->timestamp('start_datetime');
        $table->timestamp('end_datetime')->nullable();
        $table->string('location_name')->nullable();
        $table->boolean('is_published')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->ulid('model_id');
        $table->string('collection_name');
        $table->unsignedInteger('order_column')->nullable();
    });

    $this->gasan = (string) Str::ulid();
    $this->boac = (string) Str::ulid();
    CarbonImmutable::setTestNow('2026-08-11 12:00:00');
    activity()->disableLogging();
});

afterEach(function () {
    activity()->enableLogging();
    CarbonImmutable::setTestNow();
    Schema::dropIfExists('media');
    Schema::dropIfExists('events');
});

it('searches event titles and locations case-insensitively within the municipality', function () {
    $titleMatch = adminEvent($this->gasan, ['title' => 'Barangay Health Fair']);
    $locationMatch = adminEvent($this->gasan, ['location_name' => 'Gasan Covered Court']);
    adminEvent($this->gasan, ['title' => 'Unrelated event', 'location_name' => 'Municipal Hall']);
    adminEvent($this->boac, ['title' => 'Health Fair in another municipality']);

    $action = new GetAdminEventsAction;

    expect(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['search' => 'HEALTH']))))
        ->toBe([$titleMatch])
        ->and(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['search' => 'covered']))))
        ->toBe([$locationMatch]);
});

it('combines type and publication filters', function () {
    $matching = adminEvent($this->gasan, ['type' => 'festival', 'is_published' => true]);
    adminEvent($this->gasan, ['type' => 'festival', 'is_published' => false]);
    adminEvent($this->gasan, ['type' => 'community', 'is_published' => true]);

    $events = (new GetAdminEventsAction)->execute($this->gasan, AdminEventFiltersDto::fromArray([
        'type' => 'festival',
        'publication' => 'published',
    ]));

    expect(eventIds($events))->toBe([$matching]);
});

it('filters schedule states at their exact current-time boundaries', function () {
    $ongoing = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 12:00:00',
        'end_datetime' => '2026-08-11 12:00:00',
    ]);
    $upcoming = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 12:00:01',
        'end_datetime' => '2026-08-11 13:00:00',
    ]);
    $past = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 10:00:00',
        'end_datetime' => '2026-08-11 11:59:59',
    ]);

    $action = new GetAdminEventsAction;

    expect(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['schedule' => 'ongoing']))))->toBe([$ongoing])
        ->and(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['schedule' => 'upcoming']))))->toBe([$upcoming])
        ->and(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['schedule' => 'past']))))->toBe([$past]);
});

it('treats events without end times as upcoming until their start and past afterward', function () {
    $pastWithoutEnd = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 12:00:00',
        'end_datetime' => null,
    ]);
    $upcomingWithoutEnd = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 12:00:01',
        'end_datetime' => null,
    ]);

    $action = new GetAdminEventsAction;

    expect(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['schedule' => 'ongoing']))))->toBe([])
        ->and(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['schedule' => 'upcoming']))))->toBe([$upcomingWithoutEnd])
        ->and(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['schedule' => 'past']))))->toBe([$pastWithoutEnd]);
});

it('orders ongoing then upcoming then past events by operational relevance', function () {
    $pastOld = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-01 08:00:00',
        'end_datetime' => '2026-08-01 10:00:00',
    ]);
    $upcomingFar = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-20 08:00:00',
        'end_datetime' => '2026-08-20 10:00:00',
    ]);
    $ongoingLater = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 09:00:00',
        'end_datetime' => '2026-08-11 18:00:00',
    ]);
    $pastRecent = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-10 08:00:00',
        'end_datetime' => '2026-08-10 10:00:00',
    ]);
    $upcomingNear = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-12 08:00:00',
        'end_datetime' => '2026-08-12 10:00:00',
    ]);
    $ongoingSooner = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-11 08:00:00',
        'end_datetime' => '2026-08-11 14:00:00',
    ]);

    $events = (new GetAdminEventsAction)->execute($this->gasan, AdminEventFiltersDto::fromArray([]));

    expect(eventIds($events))->toBe([
        $ongoingSooner,
        $ongoingLater,
        $upcomingNear,
        $upcomingFar,
        $pastRecent,
        $pastOld,
    ]);
});

it('uses event overlap semantics for the selected date range', function () {
    $crossesStart = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-08 08:00:00',
        'end_datetime' => '2026-08-12 10:00:00',
    ]);
    $inside = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-14 08:00:00',
        'end_datetime' => '2026-08-14 10:00:00',
    ]);
    $crossesEnd = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-15 20:00:00',
        'end_datetime' => '2026-08-18 10:00:00',
    ]);
    $withoutEnd = adminEvent($this->gasan, [
        'start_datetime' => '2026-08-13 12:00:00',
        'end_datetime' => null,
    ]);
    adminEvent($this->gasan, [
        'start_datetime' => '2026-08-16 00:00:00',
        'end_datetime' => '2026-08-16 10:00:00',
    ]);

    $events = (new GetAdminEventsAction)->execute($this->gasan, AdminEventFiltersDto::fromArray([
        'date_from' => '2026-08-10',
        'date_to' => '2026-08-15',
        'sort' => 'start_asc',
    ]));

    expect(eventIds($events))->toBe([$crossesStart, $withoutEnd, $inside, $crossesEnd]);
});

it('accepts events without an end time or location', function () {
    $rules = (new StoreEventRequest)->rules();

    $payload = [
        'title' => 'Municipality-wide observance',
        'description' => 'A venue-free public observance.',
        'type' => 'holiday',
        'start_datetime' => '2026-08-20 08:00:00',
        'end_datetime' => null,
        'location_name' => '   ',
        'is_published' => true,
    ];

    expect(Validator::make($payload, $rules)->passes())->toBeTrue();

    $request = StoreEventRequest::create('/api/event', 'POST', $payload);
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->validateResolved();
    $dto = StoreEventDto::fromRequest($request, $this->gasan);

    expect($dto->endDatetime)->toBeNull()
        ->and($dto->locationName)->toBeNull();
});

it('clears existing end time and location when empty values are submitted', function () {
    $eventId = adminEvent($this->gasan, [
        'end_datetime' => '2026-08-12 10:00:00',
        'location_name' => 'Town Plaza',
    ]);

    $request = UpdateEventRequest::create("/api/event/{$eventId}", 'PUT', [
        'start_datetime' => '2026-08-12 08:00:00',
        'end_datetime' => '',
        'location_name' => '',
    ]);
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->validateResolved();
    $dto = UpdateEventDto::fromRequest($request, $this->gasan);

    expect($dto->endDatetimeProvided)->toBeTrue()
        ->and($dto->locationNameProvided)->toBeTrue()
        ->and($dto->endDatetime)->toBeNull()
        ->and($dto->locationName)->toBeNull();

    $event = (new UpdateEventAction)->execute($eventId, $dto);

    expect($event->end_datetime)->toBeNull()
        ->and($event->location_name)->toBeNull();
});

it('preserves optional event details when partial updates omit those fields', function () {
    $eventId = adminEvent($this->gasan, [
        'title' => 'Original title',
        'end_datetime' => '2026-08-12 10:00:00',
        'location_name' => 'Town Plaza',
    ]);

    $request = UpdateEventRequest::create("/api/event/{$eventId}", 'PUT', [
        'title' => 'Updated title',
    ]);
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->validateResolved();
    $dto = UpdateEventDto::fromRequest($request, $this->gasan);

    expect($dto->endDatetimeProvided)->toBeFalse()
        ->and($dto->locationNameProvided)->toBeFalse();

    $event = (new UpdateEventAction)->execute($eventId, $dto);

    expect($event->title)->toBe('Updated title')
        ->and($event->end_datetime?->format('Y-m-d H:i:s'))->toBe('2026-08-12 10:00:00')
        ->and($event->location_name)->toBe('Town Plaza');
});

it('supports explicit sorts and deterministic id tie breaking', function () {
    $firstId = '01K00000000000000000000000';
    $secondId = '01K00000000000000000000001';
    adminEvent($this->gasan, [
        'id' => $secondId,
        'start_datetime' => '2026-08-12 08:00:00',
        'end_datetime' => '2026-08-12 10:00:00',
        'updated_at' => '2026-08-10 08:00:00',
    ]);
    adminEvent($this->gasan, [
        'id' => $firstId,
        'start_datetime' => '2026-08-12 08:00:00',
        'end_datetime' => '2026-08-12 10:00:00',
        'updated_at' => '2026-08-11 08:00:00',
    ]);

    $action = new GetAdminEventsAction;

    expect(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['sort' => 'start_desc']))))
        ->toBe([$firstId, $secondId])
        ->and(eventIds($action->execute($this->gasan, AdminEventFiltersDto::fromArray(['sort' => 'updated_desc']))))
        ->toBe([$firstId, $secondId]);
});

it('keeps active filters in pagination links', function () {
    foreach (range(1, 21) as $index) {
        adminEvent($this->gasan, [
            'title' => "Town event {$index}",
            'start_datetime' => "2026-09-{$index} 08:00:00",
            'end_datetime' => "2026-09-{$index} 10:00:00",
        ]);
    }

    request()->query->replace(['search' => 'Town', 'schedule' => 'upcoming']);
    $events = (new GetAdminEventsAction)->execute($this->gasan, AdminEventFiltersDto::fromArray(request()->query()));

    expect($events->total())->toBe(21)
        ->and($events->url(2))->toContain('search=Town')
        ->and($events->url(2))->toContain('schedule=upcoming');
});

it('validates filter values and normalizes valid input', function () {
    $rules = (new IndexEventRequest)->rules();

    expect(Validator::make(['schedule' => 'later'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['publication' => 'archived'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['type' => 'conference'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['sort' => 'title'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['date_from' => '08/11/2026'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['date_from' => '2026-08-12', 'date_to' => '2026-08-11'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['page' => 0], $rules)->fails())->toBeTrue()
        ->and(Validator::make([
            'search' => '  plaza  ',
            'schedule' => 'upcoming',
            'publication' => 'draft',
            'type' => 'community',
            'date_from' => '2026-08-11',
            'date_to' => '2026-08-12',
            'sort' => 'start_asc',
            'page' => 2,
        ], $rules)->passes())->toBeTrue()
        ->and(AdminEventFiltersDto::fromArray(['search' => '  plaza  '])->search)->toBe('plaza');
});

it('returns normalized filters and filter options from the Inertia controller', function () {
    $request = IndexEventRequest::create('/gasan/admin/event', 'GET', [
        'schedule' => 'upcoming',
        'type' => 'festival',
    ]);
    $request->headers->set(Header::INERTIA, 'true');
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->validateResolved();

    app()->instance('municipal_id', $this->gasan);

    $action = Mockery::mock(GetAdminEventsAction::class);
    $action->shouldReceive('execute')
        ->once()
        ->withArgs(fn (string $municipalId, AdminEventFiltersDto $filters) => $municipalId === $this->gasan
            && $filters->schedule === 'upcoming'
            && $filters->type?->value === 'festival')
        ->andReturn(new LengthAwarePaginator([], 0, AdminEventFiltersDto::PER_PAGE));

    $response = (new IndexEventController($action))($request)->toResponse($request);
    $page = $response->getData(true);

    expect($page['component'])->toBe('Event/Admin/Index')
        ->and($page['props']['filters']['schedule'])->toBe('upcoming')
        ->and($page['props']['filters']['type'])->toBe('festival')
        ->and($page['props']['filters']['sort'])->toBe('relevance')
        ->and(collect($page['props']['type_options'])->pluck('value')->all())->toBe([
            'festival',
            'government',
            'community',
            'holiday',
        ])
        ->and(collect($page['props']['schedule_options'])->pluck('value')->all())->toBe(['ongoing', 'upcoming', 'past'])
        ->and(collect($page['props']['publication_options'])->pluck('value')->all())->toBe(['published', 'draft'])
        ->and(collect($page['props']['sort_options'])->pluck('value')->all())->toBe([
            'relevance',
            'start_asc',
            'start_desc',
            'updated_desc',
        ]);
});

function adminEvent(string $municipalId, array $overrides = []): string
{
    $createdAt = $overrides['created_at'] ?? '2026-08-01 08:00:00';
    $updatedAt = $overrides['updated_at'] ?? $createdAt;

    DB::table('events')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'title' => 'Community gathering',
        'description' => 'Municipal event description.',
        'type' => 'community',
        'start_datetime' => '2026-08-12 08:00:00',
        'end_datetime' => '2026-08-12 10:00:00',
        'location_name' => 'Town Plaza',
        'is_published' => false,
        'created_at' => $createdAt,
        'updated_at' => $updatedAt,
        'deleted_at' => null,
    ], $overrides));

    return $overrides['id'] ?? $id;
}

function eventIds(LengthAwarePaginator $events): array
{
    return collect($events->items())->pluck('id')->all();
}
