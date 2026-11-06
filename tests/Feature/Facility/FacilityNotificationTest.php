<?php

use App\Core\Facility\Actions\SaveFacilityExceptionAction;
use App\Core\Facility\Actions\SetFacilityOperatingStatusAction;
use App\Core\Facility\Actions\StoreFacilityAction;
use App\Core\Facility\Dto\FacilityExceptionDto;
use App\Core\Facility\Dto\FacilityOperatingStatusDto;
use App\Core\Facility\Dto\StoreFacilityDto;
use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Services\FacilityNotificationService;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\Permission;
use App\Core\Users\Models\Role;
use App\Core\Users\Models\User;
use App\Shared\Aga\Contracts\AgaNotificationClientInterface;
use App\Shared\Aga\Jobs\SendAgaNotificationJob;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Laravel excludes the test wrapper from after-commit callbacks; explicit nested transactions test rollback suppression.
uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
    Carbon::setTestNow(Carbon::parse('2026-11-05 10:00', 'Asia/Manila'));
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-05 10:00', 'Asia/Manila'));
    config(['services.aga_notifications' => [
        'enabled' => true, 'url' => 'https://aga.example.test/send', 'secret' => 'fake-test-secret',
        'schema' => 'test', 'timeout' => 10, 'facility_event_type' => 'facility_update',
    ]]);
    Http::preventStrayRequests();
    Bus::fake([SendAgaNotificationJob::class]);
    $this->town = Municipality::create(['id' => (string) Str::ulid(), 'name' => 'Gasan', 'slug' => 'gasan-4905',
        'municipal_code' => '4905', 'zip_code' => '4905', 'is_active' => true]);
    $this->facility = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->town->id,
        ['name' => 'Municipal Park', 'type' => 'park', 'location_name' => 'Town plaza']));
    // Publication validation is covered by FacilityModuleTest; isolate notification rules here.
    $this->facility->update(['is_published' => true]);
    $this->schedule = ['exception_date' => '2026-11-06', 'notice_type' => 'cancelled', 'is_closed' => true,
        'public_notice' => 'Closed due to strong rain.', 'periods' => []];
});

afterEach(function () {
    Carbon::setTestNow();
    CarbonImmutable::setTestNow();
});

it('queues one broadcast for an opted-in date range and sends only documented fields', function () {
    $saved = app(SaveFacilityExceptionAction::class)->execute($this->facility->id, new FacilityExceptionDto(
        $this->town->id, 0, [...$this->schedule, 'end_date' => '2026-11-08'], true,
    ));
    expect($saved->exceptions()->count())->toBe(3)->and($saved->notificationOutcome)->toBe('queued_test');
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 1);
    $job = Bus::dispatched(SendAgaNotificationJob::class)->first();
    expect($job->notification->toArray())->toBe([
        'schema' => 'test', 'audience' => 'all', 'event_type' => 'facility_update',
        'title' => 'Gasan - Municipal Park: Cancelled',
        'message' => 'Dates: 2026-11-06 to 2026-11-08. Closed due to strong rain.',
    ]);
    Http::fake(['*' => Http::response(['ok' => true, 'schema' => 'test', 'audience' => 'all',
        'devices' => 1, 'sent' => 1, 'failed' => 0, 'invalidTokens' => [], 'errors' => []])]);
    $job->handle(app(AgaNotificationClientInterface::class));
    Http::assertSent(fn ($request) => $request->data() === $job->notification->toArray());
    Http::assertSentCount(1);
});

it('saves without notifying by default and ignores identical rewritten exception periods', function () {
    $data = [...$this->schedule, 'notice_type' => 'special_hours', 'is_closed' => false,
        'periods' => [['opening_minute' => 480, 'closing_minute' => 720], ['opening_minute' => 780, 'closing_minute' => 1440]]];
    $action = app(SaveFacilityExceptionAction::class);
    $saved = $action->execute($this->facility->id, new FacilityExceptionDto($this->town->id, 0, $data));
    $exception = $saved->exceptions()->first();
    $saved = $action->execute($saved->id, new FacilityExceptionDto($this->town->id, 1,
        [...$data, 'periods' => array_reverse($data['periods'])], true), $exception->id);
    expect($saved->notificationOutcome)->toBe('unchanged');
    Bus::assertNotDispatched(SendAgaNotificationJob::class);
    $saved = $action->execute($saved->id, new FacilityExceptionDto($this->town->id, 2,
        [...$data, 'public_notice' => 'Revised holiday hours.'], true), $exception->id);
    expect($saved->notificationOutcome)->toBe('queued_test');
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 1);
    expect(Bus::dispatched(SendAgaNotificationJob::class)->first()->notification->message)
        ->toBe('Date: 2026-11-06. Revised holiday hours. Hours: 08:00-12:00, 13:00-24:00 (Philippine time).');
});

it('saves but skips notifications for drafts or unavailable delivery', function (string $reason) {
    if ($reason === 'draft') {
        $this->facility->update(['is_published' => false]);
    } elseif ($reason === 'disabled') {
        config(['services.aga_notifications.enabled' => false]);
    } else {
        config(['services.aga_notifications.secret' => '']);
    }
    $saved = app(SaveFacilityExceptionAction::class)->execute($this->facility->id,
        new FacilityExceptionDto($this->town->id, 0, $this->schedule, true));
    expect($saved->exceptions()->count())->toBe(1)->and($saved->notificationOutcome)->toBe($reason === 'draft' ? 'unpublished' : 'unavailable');
    Bus::assertNotDispatched(SendAgaNotificationJob::class);
    Http::assertNothingSent();
})->with(['draft', 'disabled', 'missing secret']);

it('waits for the outer commit and discards notifications on rollback', function () {
    DB::beginTransaction();
    app(SaveFacilityExceptionAction::class)->execute($this->facility->id,
        new FacilityExceptionDto($this->town->id, 0, $this->schedule, true));
    Bus::assertNotDispatched(SendAgaNotificationJob::class);
    DB::rollBack();
    Bus::assertNotDispatched(SendAgaNotificationJob::class);
    expect($this->facility->exceptions()->count())->toBe(0);
    DB::beginTransaction();
    app(SaveFacilityExceptionAction::class)->execute($this->facility->id,
        new FacilityExceptionDto($this->town->id, 0, $this->schedule, true));
    Bus::assertNotDispatched(SendAgaNotificationJob::class);
    DB::commit();
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 1);
});

it('does not dispatch on stale revisions, foreign municipality access or invalid updates', function () {
    $action = app(SaveFacilityExceptionAction::class);
    expect(fn () => $action->execute($this->facility->id, new FacilityExceptionDto($this->town->id, 10, $this->schedule, true)))
        ->toThrow(ValidationException::class);
    expect(fn () => $action->execute($this->facility->id, new FacilityExceptionDto((string) Str::ulid(), 0, $this->schedule, true)))
        ->toThrow(ModelNotFoundException::class);
    expect(fn () => $action->execute($this->facility->id, new FacilityExceptionDto($this->town->id, 0, [...$this->schedule, 'public_notice' => ''], true)))
        ->toThrow(ValidationException::class);
    expect($this->facility->exceptions()->count())->toBe(0);
    Bus::assertNotDispatched(SendAgaNotificationJob::class);
});

it('notifies changed holds and resumption without claiming the facility is open', function () {
    $action = app(SetFacilityOperatingStatusAction::class);
    $dto = fn ($revision) => new FacilityOperatingStatusDto($this->town->id, $revision,
        FacilityOperatingStatus::TEMPORARILY_CLOSED, 'Rain warning.', CarbonImmutable::parse('2026-11-05 15:00', 'Asia/Manila'), notifyMobile: true);
    $action->execute($this->facility->id, $dto(0));
    $saved = $action->execute($this->facility->id, $dto(1));
    expect($saved->notificationOutcome)->toBe('unchanged');
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 1);
    expect(Bus::dispatched(SendAgaNotificationJob::class)->first()->notification->message)
        ->toBe('Rain warning. Expected reopening: 2026-11-05 15:00 (Philippine time; estimate only).');
    $action->execute($this->facility->id, new FacilityOperatingStatusDto($this->town->id, 2,
        FacilityOperatingStatus::FOLLOWING_SCHEDULE, null, todayException: [
            'exception_date' => '2026-11-05', 'notice_type' => 'special_hours', 'is_closed' => false,
            'public_notice' => 'Reopening this afternoon.', 'periods' => [['opening_minute' => 780, 'closing_minute' => 1020]],
        ], notifyMobile: true));
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 2);
    $message = Bus::dispatched(SendAgaNotificationJob::class)->last()->notification;
    expect($message->title)->toBe('Gasan - Municipal Park: Schedule resumed')
        ->and($message->message)->toBe('The operating hold has been cleared. Check the latest facility hours before visiting. Revised hours today: 13:00-17:00 (Philippine time). Reopening this afternoon.');
});

it('accepts the admin opt-in through the existing request DTO flow', function () {
    Role::findOrCreate('admin', 'web');
    $admin = User::factory()->create(['municipal_id' => $this->town->id]);
    $admin->assignRole('admin');
    foreach (['facility.access', 'facility.view', 'facility.manage'] as $permission) {
        Permission::findOrCreate($permission, 'web');
        $admin->givePermissionTo($permission);
    }
    $this->actingAs($admin)->withHeader('X-Municipality-Slug', $this->town->slug)
        ->post('/api/facility/'.$this->facility->id.'/exceptions', [...$this->schedule, 'revision' => 0, 'notify_mobile' => true])
        ->assertRedirect()->assertSessionHas('success', 'Schedule exception added. Test notification queued for AGA Mobile test devices.');
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 1);
    $this->patch('/api/facility/'.$this->facility->id.'/operating-status', [
        'revision' => 1, 'operating_status' => 'temporarily_closed', 'operating_notice' => 'Storm warning.', 'notify_mobile' => true,
    ])->assertRedirect()->assertSessionHas('success', 'Facility updated. Test notification queued for AGA Mobile test devices.');
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 2);
});

it('keeps the committed update and reports a sanitized dispatch failure', function () {
    Bus::shouldReceive('dispatch')->once()->andThrow(new RuntimeException('fake-sensitive-transport-diagnostic'));
    Log::spy();
    $saved = app(SaveFacilityExceptionAction::class)->execute($this->facility->id,
        new FacilityExceptionDto($this->town->id, 0, $this->schedule, true));
    expect($saved->fresh()->revision)->toBe(1)->and($saved->exceptions()->count())->toBe(1)
        ->and($saved->notificationOutcome)->toBe('queue_failed');
    expect(app(FacilityNotificationService::class)->feedback($saved, 'Saved.'))
        ->toBe('Saved. Notification delivery could not be started. The update was saved; review before retrying.');
    Log::shouldHaveReceived('warning')->once()->with('Facility notification could not be queued or delivered.', ['facility_id' => $saved->id]);
});

it('exposes only availability and destination in admin notification options', function () {
    expect(app(FacilityNotificationService::class)->options())->toBe(['available' => true, 'schema' => 'test']);
    config(['services.aga_notifications.schema' => 'unexpected']);
    expect(app(FacilityNotificationService::class)->options())->toBe(['available' => false, 'schema' => 'test']);
});

it('allows facility broadcasts without an event type', function (mixed $eventType) {
    config(['services.aga_notifications.facility_event_type' => $eventType]);
    expect(app(FacilityNotificationService::class)->options()['available'])->toBeTrue();
    $saved = app(SaveFacilityExceptionAction::class)->execute($this->facility->id,
        new FacilityExceptionDto($this->town->id, 0, $this->schedule, true));
    expect($saved->notificationOutcome)->toBe('queued_test');
    Bus::assertDispatchedTimes(SendAgaNotificationJob::class, 1);
    expect(Bus::dispatched(SendAgaNotificationJob::class)->first()->notification->toArray())->not->toHaveKey('event_type');
})->with([null, '', '   ']);
