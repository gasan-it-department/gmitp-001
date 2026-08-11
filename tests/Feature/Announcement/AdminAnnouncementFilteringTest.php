<?php

use App\Core\Announcement\Actions\GetAdminAnnouncementsAction;
use App\Core\Announcement\Dto\AdminAnnouncementFiltersDto;
use App\External\Api\Request\Announcement\IndexAnnouncementRequest;
use App\External\Web\Controllers\Announcement\Admin\IndexAnnouncementController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Support\Header;

beforeEach(function () {
    Schema::create('announcements', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->index();
        $table->ulid('user_id')->nullable();
        $table->string('title');
        $table->text('content');
        $table->string('type', 32);
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
});

afterEach(function () {
    Schema::dropIfExists('media');
    Schema::dropIfExists('announcements');
});

it('searches announcement titles case-insensitively within the municipality', function () {
    $matching = adminAnnouncement($this->gasan, ['title' => 'Scheduled Water Interruption']);
    adminAnnouncement($this->gasan, ['title' => 'Municipal scholarship applications']);
    adminAnnouncement($this->boac, ['title' => 'Water interruption in another municipality']);

    $announcements = (new GetAdminAnnouncementsAction)->execute(
        $this->gasan,
        AdminAnnouncementFiltersDto::fromArray(['search' => 'WATER']),
    );

    expect(announcementIds($announcements))->toBe([$matching]);
});

it('combines type and publication filters', function () {
    $matching = adminAnnouncement($this->gasan, ['type' => 'advisory', 'is_published' => true]);
    adminAnnouncement($this->gasan, ['type' => 'advisory', 'is_published' => false]);
    adminAnnouncement($this->gasan, ['type' => 'general', 'is_published' => true]);

    $announcements = (new GetAdminAnnouncementsAction)->execute(
        $this->gasan,
        AdminAnnouncementFiltersDto::fromArray([
            'type' => 'advisory',
            'publication' => 'published',
        ]),
    );

    expect(announcementIds($announcements))->toBe([$matching]);
});

it('supports every sort mode with deterministic id tie breaking', function () {
    $oldestId = '01K00000000000000000000000';
    $newestFirstId = '01K00000000000000000000001';
    $newestSecondId = '01K00000000000000000000002';

    adminAnnouncement($this->gasan, [
        'id' => $oldestId,
        'created_at' => '2026-08-01 08:00:00',
        'updated_at' => '2026-08-10 08:00:00',
    ]);
    adminAnnouncement($this->gasan, [
        'id' => $newestSecondId,
        'created_at' => '2026-08-11 08:00:00',
        'updated_at' => '2026-08-09 08:00:00',
    ]);
    adminAnnouncement($this->gasan, [
        'id' => $newestFirstId,
        'created_at' => '2026-08-11 08:00:00',
        'updated_at' => '2026-08-11 08:00:00',
    ]);

    $action = new GetAdminAnnouncementsAction;

    expect(announcementIds($action->execute($this->gasan, AdminAnnouncementFiltersDto::fromArray([]))))
        ->toBe([$newestFirstId, $newestSecondId, $oldestId])
        ->and(announcementIds($action->execute(
            $this->gasan,
            AdminAnnouncementFiltersDto::fromArray(['sort' => 'created_asc']),
        )))
        ->toBe([$oldestId, $newestFirstId, $newestSecondId])
        ->and(announcementIds($action->execute(
            $this->gasan,
            AdminAnnouncementFiltersDto::fromArray(['sort' => 'updated_desc']),
        )))
        ->toBe([$newestFirstId, $oldestId, $newestSecondId]);
});

it('keeps active filters in pagination links', function () {
    foreach (range(1, 21) as $index) {
        adminAnnouncement($this->gasan, [
            'title' => "Town advisory {$index}",
            'type' => 'advisory',
        ]);
    }

    request()->query->replace(['search' => 'Town', 'type' => 'advisory']);
    $announcements = (new GetAdminAnnouncementsAction)->execute(
        $this->gasan,
        AdminAnnouncementFiltersDto::fromArray(request()->query()),
    );

    expect($announcements->total())->toBe(21)
        ->and($announcements->url(2))->toContain('search=Town')
        ->and($announcements->url(2))->toContain('type=advisory');
});

it('validates filter values and normalizes valid input', function () {
    $rules = (new IndexAnnouncementRequest)->rules();

    expect(Validator::make(['publication' => 'archived'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['type' => 'festival'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['sort' => 'title'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['page' => 0], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['search' => str_repeat('a', 256)], $rules)->fails())->toBeTrue()
        ->and(Validator::make([
            'search' => '  water  ',
            'publication' => 'draft',
            'type' => 'utility_interruption',
            'sort' => 'updated_desc',
            'page' => 2,
        ], $rules)->passes())->toBeTrue()
        ->and(AdminAnnouncementFiltersDto::fromArray(['search' => '  water  '])->search)->toBe('water');
});

it('returns normalized filters and filter options from the Inertia controller', function () {
    $request = IndexAnnouncementRequest::create('/gasan/admin/announcement', 'GET', [
        'publication' => 'draft',
        'type' => 'emergency',
    ]);
    $request->headers->set(Header::INERTIA, 'true');
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->validateResolved();

    app()->instance('municipal_id', $this->gasan);

    $action = Mockery::mock(GetAdminAnnouncementsAction::class);
    $action->shouldReceive('execute')
        ->once()
        ->withArgs(fn (string $municipalId, AdminAnnouncementFiltersDto $filters) => $municipalId === $this->gasan
            && $filters->publication === 'draft'
            && $filters->type?->value === 'emergency')
        ->andReturn(new LengthAwarePaginator([], 0, AdminAnnouncementFiltersDto::PER_PAGE));

    $response = (new IndexAnnouncementController($action))($request)->toResponse($request);
    $page = $response->getData(true);

    expect($page['component'])->toBe('Announcement/Admin/Index')
        ->and($page['props']['filters']['publication'])->toBe('draft')
        ->and($page['props']['filters']['type'])->toBe('emergency')
        ->and($page['props']['filters']['sort'])->toBe('created_desc')
        ->and(collect($page['props']['type_options'])->pluck('value')->all())->toBe([
            'emergency',
            'advisory',
            'utility_interruption',
            'roadwork',
            'general',
        ])
        ->and(collect($page['props']['publication_options'])->pluck('value')->all())->toBe(['published', 'draft'])
        ->and(collect($page['props']['sort_options'])->pluck('value')->all())->toBe([
            'created_desc',
            'created_asc',
            'updated_desc',
        ]);
});

function adminAnnouncement(string $municipalId, array $overrides = []): string
{
    $createdAt = $overrides['created_at'] ?? '2026-08-01 08:00:00';
    $updatedAt = $overrides['updated_at'] ?? $createdAt;

    DB::table('announcements')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'user_id' => null,
        'title' => 'Community announcement',
        'content' => 'Municipal announcement content.',
        'type' => 'general',
        'is_published' => false,
        'created_at' => $createdAt,
        'updated_at' => $updatedAt,
        'deleted_at' => null,
    ], $overrides));

    return $overrides['id'] ?? $id;
}

function announcementIds(LengthAwarePaginator $announcements): array
{
    return collect($announcements->items())->pluck('id')->all();
}
