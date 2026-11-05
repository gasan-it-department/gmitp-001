<?php

use App\Core\Facility\Actions\DeleteFacilityAction;
use App\Core\Facility\Actions\DeleteFacilityExceptionAction;
use App\Core\Facility\Actions\GetFacilitiesAction;
use App\Core\Facility\Actions\GetFacilityDetailsAction;
use App\Core\Facility\Actions\ReplaceWeeklyHoursAction;
use App\Core\Facility\Actions\SaveFacilityExceptionAction;
use App\Core\Facility\Actions\SetFacilityOperatingStatusAction;
use App\Core\Facility\Actions\SetFacilityPublicationAction;
use App\Core\Facility\Actions\StoreFacilityAction;
use App\Core\Facility\Actions\UpdateFacilityAction;
use App\Core\Facility\Dto\StoreFacilityDto;
use App\Core\Facility\Dto\UpdateFacilityDto;
use App\Core\Facility\Dto\FacilityExceptionDto;
use App\Core\Facility\Dto\FacilityMutationDto;
use App\Core\Facility\Dto\FacilityOperatingStatusDto;
use App\Core\Facility\Dto\WeeklyHoursDto;
use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityAvailabilityService;
use App\Core\Facility\Services\FacilityScheduleValidator;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\User;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use App\Core\Users\Models\Permission;
use App\Core\Users\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
    Carbon::setTestNow(Carbon::parse('2026-11-02 10:00:00', 'Asia/Manila'));
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-02 10:00:00', 'Asia/Manila'));
    $this->gasan = Municipality::create(['id' => (string) Str::ulid(), 'name' => 'Gasan', 'slug' => 'gasan-4905', 'municipal_code' => '4905', 'zip_code' => '4905', 'is_active' => true]);
    $this->boac = Municipality::create(['id' => (string) Str::ulid(), 'name' => 'Boac', 'slug' => 'boac-4900', 'municipal_code' => '4900', 'zip_code' => '4900', 'is_active' => true]);
    $this->facility = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->gasan->id, ['name' => 'Children’s Train', 'type' => 'amusement_ride', 'location_name' => 'Municipal Plaza']));
});

afterEach(function () {
    Carbon::setTestNow();
    CarbonImmutable::setTestNow();
});

function facilityTestWeek(Facility $facility, array $hours = [1 => [[480, 720], [780, 1020]]]): Facility
{
    $days = [];
    foreach (range(1, 7) as $day) {
        $days[] = ['day_of_week' => $day, 'is_closed' => empty($hours[$day]), 'periods' => array_map(fn ($period) => ['opening_minute' => $period[0], 'closing_minute' => $period[1]], $hours[$day] ?? [])];
    }

    return app(ReplaceWeeklyHoursAction::class)->execute($facility->id, new WeeklyHoursDto($facility->municipal_id, $facility->fresh()->revision, $days));
}

function facilityTestAvailability(Facility $facility, string $instant): array
{
    return app(FacilityAvailabilityService::class)->calculate($facility->fresh()->load('weeklyDays.periods', 'exceptions.periods'), CarbonImmutable::parse($instant, 'Asia/Manila'));
}

function facilityTestException(Facility $facility, array $overrides = []): Facility
{
    return app(SaveFacilityExceptionAction::class)->execute($facility->id, new FacilityExceptionDto($facility->municipal_id, $facility->fresh()->revision,
        array_replace(['exception_date' => '2026-11-02', 'notice_type' => 'closed', 'is_closed' => true, 'public_notice' => 'Closed for maintenance.', 'periods' => []], $overrides)));
}

function facilityTestAdmin(Municipality $municipality, array $permissions): User
{
    Role::findOrCreate('admin', 'web');
    $user = User::factory()->create(['municipal_id' => $municipality->id]);
    $user->assignRole('admin');
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
    $user->givePermissionTo($permissions);

    return $user;
}

function facilityTestPublish(Facility $facility): Facility
{
    facilityTestWeek($facility);

    return app(SetFacilityPublicationAction::class)->execute(
        $facility->id, new FacilityMutationDto($facility->municipal_id, $facility->fresh()->revision), true,
    );
}

it('handles exact boundaries and multiple opening periods', function () {
    facilityTestWeek($this->facility);
    expect(facilityTestAvailability($this->facility, '2026-11-02 07:59')['is_open'])->toBeFalse()
        ->and(facilityTestAvailability($this->facility, '2026-11-02 08:00')['is_open'])->toBeTrue()
        ->and(facilityTestAvailability($this->facility, '2026-11-02 12:00')['next_opens_at'])->toBe('2026-11-02T13:00:00+08:00')
        ->and(facilityTestAvailability($this->facility, '2026-11-02 13:00')['is_open'])->toBeTrue()
        ->and(facilityTestAvailability($this->facility, '2026-11-02 17:00')['is_open'])->toBeFalse();
});

it('interprets absolute instants in Manila and joins touching periods across Sunday midnight', function () {
    facilityTestWeek($this->facility, [7 => [[1320, 1440]], 1 => [[0, 60], [60, 120]]]);
    $service = app(FacilityAvailabilityService::class);
    $facility = $this->facility->fresh()->load('weeklyDays.periods', 'exceptions.periods');
    $status = $service->calculate($facility, CarbonImmutable::parse('2026-11-01 15:00:00', 'UTC'));
    expect($status['is_open'])->toBeTrue()->and($status['closes_at'])->toBe('2026-11-02T02:00:00+08:00');
    facilityTestException($this->facility);
    expect(facilityTestAvailability($this->facility, '2026-11-01 23:00')['closes_at'])->toBe('2026-11-02T00:00:00+08:00');
});

it('replaces weekly hours with confirmed delayed hours and clears the delayed badge once open', function () {
    facilityTestWeek($this->facility);
    facilityTestException($this->facility, ['is_closed' => false, 'notice_type' => 'delayed', 'periods' => [['opening_minute' => 1080, 'closing_minute' => 1200]]]);
    expect(facilityTestAvailability($this->facility, '2026-11-02 10:00')['status'])->toBe('delayed')
        ->and(facilityTestAvailability($this->facility, '2026-11-02 10:00')['next_opens_at'])->toBe('2026-11-02T18:00:00+08:00')
        ->and(facilityTestAvailability($this->facility, '2026-11-02 18:00')['status'])->toBe('open')
        ->and(facilityTestAvailability($this->facility, '2026-11-09 10:00')['status'])->toBe('open');
});

it('searches past a multiweek closure without a seven-day cutoff', function () {
    facilityTestWeek($this->facility, array_fill(1, 7, [[480, 1020]]));
    facilityTestException($this->facility, ['end_date' => '2026-11-16', 'notice_type' => 'cancelled']);
    $status = facilityTestAvailability($this->facility, '2026-11-02 10:00');
    expect($status['status'])->toBe('cancelled')->and($status['next_opens_at'])->toBe('2026-11-17T08:00:00+08:00');
});

it('finds a distant special opening when every weekday is closed', function () {
    facilityTestWeek($this->facility, []);
    facilityTestException($this->facility, ['exception_date' => '2028-12-25', 'notice_type' => 'special_hours', 'is_closed' => false, 'periods' => [['opening_minute' => 600, 'closing_minute' => 720]]]);
    expect(facilityTestAvailability($this->facility, '2026-11-02 10:00')['next_opens_at'])->toBe('2028-12-25T10:00:00+08:00');
});

it('handles continuously open weeks and their next future closing exception', function () {
    facilityTestWeek($this->facility, array_fill(1, 7, [[0, 1440]]));
    expect(facilityTestAvailability($this->facility, '2026-11-02 10:00')['closes_at'])->toBeNull();
    facilityTestException($this->facility, ['exception_date' => '2026-12-25']);
    expect(facilityTestAvailability($this->facility, '2026-11-02 10:00')['closes_at'])->toBe('2026-12-25T00:00:00+08:00');
});

it('keeps uncertain delays active past their estimate and midnight until explicitly resumed', function () {
    facilityTestWeek($this->facility, array_fill(1, 7, [[480, 1020]]));
    app(SetFacilityOperatingStatusAction::class)->execute($this->facility->id, new FacilityOperatingStatusDto($this->gasan->id, $this->facility->fresh()->revision,
        FacilityOperatingStatus::DELAYED, 'Awaiting repair.', CarbonImmutable::parse('2026-11-02 11:00', 'Asia/Manila')));
    $status = facilityTestAvailability($this->facility, '2026-11-03 10:00');
    expect($status['status'])->toBe('delayed')->and($status['next_opens_at'])->toBeNull()->and($status['is_open'])->toBeFalse();
    app(SetFacilityOperatingStatusAction::class)->execute($this->facility->id, new FacilityOperatingStatusDto($this->gasan->id, $this->facility->fresh()->revision, FacilityOperatingStatus::FOLLOWING_SCHEDULE, null));
    expect(facilityTestAvailability($this->facility, '2026-11-03 10:00')['is_open'])->toBeTrue()->and($this->facility->fresh()->expected_reopens_at)->toBeNull();
});

it('atomically resumes with revised hours and records their audit history', function () {
    facilityTestWeek($this->facility);
    facilityTestException($this->facility);
    app(SetFacilityOperatingStatusAction::class)->execute($this->facility->id, new FacilityOperatingStatusDto($this->gasan->id, $this->facility->fresh()->revision,
        FacilityOperatingStatus::TEMPORARILY_CLOSED, 'Maintenance.'));
    app(SetFacilityOperatingStatusAction::class)->execute($this->facility->id, new FacilityOperatingStatusDto($this->gasan->id, $this->facility->fresh()->revision,
        FacilityOperatingStatus::FOLLOWING_SCHEDULE, null, todayException: ['exception_date' => '2026-11-02', 'notice_type' => 'special_hours', 'is_closed' => false,
            'public_notice' => 'Repaired; reopening at noon.', 'periods' => [['opening_minute' => 720, 'closing_minute' => 1020]]]));
    expect(facilityTestAvailability($this->facility, '2026-11-02 12:00')['is_open'])->toBeTrue()
        ->and($this->facility->activities()->where('description', 'Revised hours saved while resuming')->exists())->toBeTrue();
});

it('requires configured hours before publishing but accepts seven explicitly closed days', function () {
    expect(fn () => app(SetFacilityPublicationAction::class)->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, 0), true))->toThrow(ValidationException::class);
    expect(facilityTestAvailability($this->facility, '2026-11-02 10:00')['is_open'])->toBeNull();
    facilityTestWeek($this->facility, []);
    $action = app(SetFacilityPublicationAction::class);
    $action->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, 1), true);
    $action->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, 2), true);
    expect($this->facility->fresh()->is_published)->toBeTrue()->and(facilityTestAvailability($this->facility, '2026-11-02 10:00')['next_opens_at'])->toBeNull();
});

it('rejects invalid periods, missing weekdays and inconsistent exception types', function () {
    $validator = app(FacilityScheduleValidator::class);
    $days = array_map(fn ($day) => ['day_of_week' => $day, 'is_closed' => false, 'periods' => [['opening_minute' => 480, 'closing_minute' => 720], ['opening_minute' => 700, 'closing_minute' => 900]]], range(1, 7));
    expect(fn () => $validator->weekly($days))->toThrow(ValidationException::class);
    $days[0]['periods'] = [['opening_minute' => 1320, 'closing_minute' => 120]];
    expect(fn () => $validator->weekly($days))->toThrow(ValidationException::class);
    expect(fn () => $validator->weekly(array_slice($days, 1)))->toThrow(ValidationException::class);
    expect(fn () => facilityTestException($this->facility, ['notice_type' => 'delayed']))->toThrow(ValidationException::class);
});

it('rejects stale edits and conflicting bulk updates without partially writing', function () {
    facilityTestWeek($this->facility);
    facilityTestException($this->facility, ['exception_date' => '2026-11-03']);
    $before = $this->facility->fresh()->revision;
    expect(fn () => facilityTestException($this->facility, ['end_date' => '2026-11-04']))->toThrow(ValidationException::class);
    expect($this->facility->exceptions()->count())->toBe(1)->and($this->facility->fresh()->revision)->toBe($before);
    expect(fn () => app(UpdateFacilityAction::class)->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, ['name' => 'Stale edit'], 0)))->toThrow(ValidationException::class);
    expect($this->facility->fresh()->name)->toBe('Children’s Train');
});

it('preserves omitted profile fields and clears explicitly submitted nullable fields', function () {
    $action = app(UpdateFacilityAction::class);
    $action->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, ['contact_phone' => '09123456789'], 0));
    $action->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, ['description' => 'Train ride.'], 1));
    expect($this->facility->fresh()->contact_phone)->toBe('09123456789');
    $action->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, ['contact_phone' => null], 2));
    expect($this->facility->fresh()->contact_phone)->toBeNull();
});

it('does not let profile data change ownership publication or operating status', function () {
    app(UpdateFacilityAction::class)->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, [
        'municipal_id' => $this->boac->id, 'is_published' => true, 'operating_status' => 'permanently_closed', 'revision' => 99,
    ], 0));
    expect($this->facility->fresh()->municipal_id)->toBe($this->gasan->id)
        ->and($this->facility->fresh()->is_published)->toBeFalse()
        ->and($this->facility->fresh()->operating_status)->toBe(FacilityOperatingStatus::FOLLOWING_SCHEDULE)
        ->and($this->facility->fresh()->revision)->toBe(1);
});

it('rejects a duplicate single date and restores weekly hours after removing an exception', function () {
    facilityTestWeek($this->facility);
    facilityTestException($this->facility, ['notice_type' => 'cancelled']);
    expect(fn () => facilityTestException($this->facility))->toThrow(ValidationException::class);
    $exception = $this->facility->exceptions()->first();
    expect($exception->getRawOriginal('exception_date'))->toBe('2026-11-02');
    app(DeleteFacilityExceptionAction::class)->execute($this->facility->id, $exception->id, new FacilityMutationDto($this->gasan->id, $this->facility->fresh()->revision));
    expect(facilityTestAvailability($this->facility, '2026-11-02 10:00')['is_open'])->toBeTrue();
});

it('keeps separate facilities independent when one is delayed', function () {
    $playground = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->gasan->id, ['name' => 'Playground', 'type' => 'playground', 'location_name' => 'Municipal Plaza']));
    facilityTestWeek($playground);
    facilityTestWeek($this->facility);
    app(SetFacilityOperatingStatusAction::class)->execute($this->facility->id, new FacilityOperatingStatusDto($this->gasan->id, 1, FacilityOperatingStatus::DELAYED, 'Repairing the train.'));
    expect(facilityTestAvailability($playground, '2026-11-02 10:00')['is_open'])->toBeTrue()
        ->and(facilityTestAvailability($this->facility, '2026-11-02 10:00')['is_open'])->toBeFalse();
});

it('registers facility permissions without changing existing grants', function () {
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view']);
    $before = $admin->getAllPermissions()->pluck('name')->sort()->values()->all();
    $this->seed(Database\Seeders\FacilityPermissionSeeder::class);
    $this->seed(Database\Seeders\FacilityPermissionSeeder::class);
    expect(Permission::where('name', 'like', 'facility.%')->count())->toBe(5)
        ->and($admin->fresh()->getAllPermissions()->pluck('name')->sort()->values()->all())->toBe($before);
});

it('accepts the complete admin mutation flow using the actual middleware and controllers', function () {
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage', 'facility.publish', 'facility.delete']);
    $this->actingAs($admin);
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $base = '/api/facility/'.$this->facility->id;
    $days = array_map(fn ($day) => ['day_of_week' => $day, 'is_closed' => false, 'periods' => [['opening_minute' => 480, 'closing_minute' => 1020]]], range(1, 7));
    $this->put($base.'/weekly-hours', ['revision' => 0, 'days' => $days], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->patch($base.'/publish', ['revision' => 1, 'is_published' => true], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->post($base.'/exceptions', ['revision' => 2, 'exception_date' => '2026-11-02', 'notice_type' => 'cancelled', 'is_closed' => true, 'public_notice' => 'Heavy rain.', 'periods' => []], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $exception = $this->facility->exceptions()->firstOrFail();
    $this->put($base.'/exceptions/'.$exception->id, ['revision' => 3, 'exception_date' => '2026-11-02', 'notice_type' => 'delayed', 'is_closed' => false,
        'public_notice' => 'Confirmed opening at noon.', 'periods' => [['opening_minute' => 720, 'closing_minute' => 1020]]], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->patch($base.'/operating-status', ['revision' => 4, 'operating_status' => 'delayed', 'operating_notice' => 'Mechanical issue.', 'expected_reopens_at' => '2026-11-02T15:00'], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->get('/'.$this->gasan->slug.'/admin/facility/'.$this->facility->id.'/edit')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Facility/Admin/Form')->where('facility.revision', 5)->where('facility.expected_reopens_at_input', '2026-11-02T15:00'));
    $this->patch($base.'/operating-status', ['revision' => 5, 'operating_status' => 'following_schedule'], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->delete($base.'/exceptions/'.$exception->id, ['revision' => 6], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->delete($base, ['revision' => 7], $headers)->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->trashed())->toBeTrue();
});

it('enforces database tenant ownership and weekday uniqueness using the real migrations', function () {
    facilityTestWeek($this->facility);
    $day = $this->facility->weeklyDays()->first();
    expect(fn () => DB::transaction(fn () => DB::table('facility_weekly_periods')->insert(['id' => (string) Str::ulid(), 'municipal_id' => $this->boac->id,
        'weekly_day_id' => $day->id, 'opening_minute' => 60, 'closing_minute' => 120, 'created_at' => now(), 'updated_at' => now()])))->toThrow(QueryException::class);
    expect(fn () => DB::transaction(fn () => $this->facility->weeklyDays()->create(['municipal_id' => $this->gasan->id, 'day_of_week' => $day->day_of_week, 'is_closed' => true])))->toThrow(QueryException::class);
});

it('isolates reads and nested mutations by municipality and facility', function () {
    $other = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->boac->id, ['name' => 'Boac Park', 'type' => 'park', 'location_name' => 'Boac']));
    facilityTestException($other);
    $foreignException = $other->exceptions()->first();
    expect(fn () => app(GetFacilityDetailsAction::class)->execute($this->gasan->id, $other->id))->toThrow(ModelNotFoundException::class);
    expect(fn () => app(UpdateFacilityAction::class)->execute($other->id, new UpdateFacilityDto($this->gasan->id, ['name' => 'Wrong town'], $other->fresh()->revision)))->toThrow(ModelNotFoundException::class);
    expect(fn () => app(DeleteFacilityExceptionAction::class)->execute($this->facility->id, $foreignException->id, new FacilityMutationDto($this->gasan->id, 0)))->toThrow(ModelNotFoundException::class);
    expect(app(GetFacilitiesAction::class)->execute($this->gasan->id)->total())->toBe(1);
});

it('uses the slug header middleware for mutations and rejects forged IDs and jurisdiction', function () {
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage']);
    $this->actingAs($admin)->post('/api/facility', ['name' => 'Municipal Park', 'type' => 'park', 'location_name' => 'Plaza'], ['X-Municipality-Slug' => $this->gasan->slug])->assertRedirect();
    expect(Facility::where('name', 'Municipal Park')->firstOrFail()->municipal_id)->toBe($this->gasan->id);
    $this->postJson('/api/facility', ['name' => 'Forged', 'type' => 'park', 'municipal_id' => $this->boac->id], ['X-Municipality-Slug' => $this->gasan->slug])->assertUnprocessable()->assertJsonValidationErrors('municipal_id');
    $this->post('/api/facility', ['name' => 'Wrong town', 'type' => 'park'], ['X-Municipality-Slug' => $this->boac->slug])->assertForbidden();
    $this->patch('/api/facility/'.$this->facility->id.'/publish', ['revision' => 0, 'is_published' => true], ['X-Municipality-Slug' => $this->gasan->slug])->assertForbidden();
});

it('exposes only published facilities and public fields through actual Inertia pages', function () {
    $path = '/'.$this->gasan->slug.'/facility/'.$this->facility->id;
    $this->get($path)->assertNotFound();
    facilityTestWeek($this->facility);
    app(SetFacilityPublicationAction::class)->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, 1), true);
    $this->get($path)->assertOk()->assertInertia(fn (Assert $page) => $page->component('Facility/Client/Show')
        ->where('facility.availability.is_open', true)->where('facility.weekly_days.0.day_of_week', 1)
        ->missing('facility.municipal_id')->missing('facility.revision')->missing('facility.audit_log'));
    $this->get('/'.$this->boac->slug.'/facility/'.$this->facility->id)->assertNotFound();
    app(DeleteFacilityAction::class)->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, 2));
    $this->get($path)->assertNotFound();
    expect($this->facility->weeklyDays()->count())->toBe(7);
});

it('stores media in municipality-specific paths and supports explicit image removal', function () {
    Storage::fake('public');
    config(['media-library.disk_name' => 'public']);
    $action = app(UpdateFacilityAction::class);
    $action->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, [], 0, UploadedFile::fake()->image('train.jpg')));
    $media = $this->facility->fresh()->getFirstMedia('facility_image');
    expect($media->getPathRelativeToRoot())->toStartWith($this->gasan->id.'/facilities/'.$this->facility->id.'/');
    Storage::disk('public')->assertExists($media->getPathRelativeToRoot());
    $action->execute($this->facility->id, new UpdateFacilityDto($this->gasan->id, [], 1, removeImage: true));
    expect($this->facility->fresh()->getFirstMedia('facility_image'))->toBeNull();
});

function facilityTestAddressCatalogue(Municipality $gasan, Municipality $boac): array
{
    $region = DB::table('psgc_regions')->insertGetId(['psgc_code' => '170000000', 'name' => 'MIMAROPA']);
    $province = DB::table('psgc_provinces')->insertGetId(['region_id' => $region, 'psgc_code' => '174000000', 'name' => 'Marinduque']);
    $psgcGasan = DB::table('psgc_municipalities')->insertGetId(['region_id' => $region, 'province_id' => $province, 'psgc_code' => '174003000', 'name' => 'Gasan']);
    $psgcBoac = DB::table('psgc_municipalities')->insertGetId(['region_id' => $region, 'province_id' => $province, 'psgc_code' => '174001000', 'name' => 'Boac']);
    $gasan->update(['psgc_municipal_id' => $psgcGasan]);
    $boac->update(['psgc_municipal_id' => $psgcBoac]);
    $pinggan = DB::table('psgc_barangays')->insertGetId(['municipality_id' => $psgcGasan, 'psgc_code' => '174003001', 'name' => 'Pinggan']);
    DB::table('psgc_barangays')->insert(['municipality_id' => $psgcBoac, 'psgc_code' => '174001001', 'name' => 'Isok I']);
    DB::table('psgc_barangays')->insert(['municipality_id' => $psgcGasan, 'psgc_code' => '174003099', 'name' => 'Retired barangay', 'deleted_at' => now()]);

    return ['pinggan' => $pinggan];
}

it('stores only street and local barangay in the address column without changing landmark or ownership', function () {
    facilityTestAddressCatalogue($this->gasan, $this->boac);
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage', 'facility.publish']);
    $this->actingAs($admin);
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $this->post('/api/facility', [
        'name' => 'Visitor Centre', 'type' => 'other', 'location_name' => 'Municipal Plaza',
        'address' => 'Previous address',
        'address_parts' => ['street' => '  Beside the main entrance  ', 'barangay' => 'Pinggan'],
    ], $headers)->assertSessionHasNoErrors()->assertRedirect();

    $facility = Facility::where('name', 'Visitor Centre')->firstOrFail();
    expect($facility->municipal_id)->toBe($this->gasan->id)
        ->and($facility->location_name)->toBe('Municipal Plaza')
        ->and($facility->address)->toBe('Beside the main entrance, Pinggan')
        ->and(Illuminate\Support\Facades\Schema::hasColumn('facilities', 'address_barangay'))->toBeFalse();

    $this->get('/'.$this->gasan->slug.'/admin/facility/'.$facility->id.'/edit')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('facility.address', 'Beside the main entrance, Pinggan')
            ->where('facility.location_name', 'Municipal Plaza')->missing('facility.address_parts'));
    facilityTestWeek($facility);
    app(SetFacilityPublicationAction::class)->execute($facility->id, new FacilityMutationDto($this->gasan->id, 1), true);
    $this->get('/'.$this->gasan->slug.'/facility/'.$facility->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('facility.address', 'Beside the main entrance, Pinggan')
            ->missing('facility.municipal_id'));
});

it('preserves an unchanged full address and replaces it only when new parts are submitted', function () {
    facilityTestAddressCatalogue($this->gasan, $this->boac);
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage']);
    $this->actingAs($admin);
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $base = '/api/facility/'.$this->facility->id;
    $this->put($base, ['revision' => 0, 'address' => 'Old complete address'], $headers)->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->address)->toBe('Old complete address');
    $this->put($base, ['revision' => 1, 'address' => 'Old complete address', 'address_parts' => null, 'description' => 'Unrelated profile edit'], $headers)
        ->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->address)->toBe('Old complete address');
    $this->put($base, ['revision' => 2, 'location_name' => null,
        'address_parts' => ['barangay' => 'Pinggan', 'street' => ''],
    ], $headers)->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->address)->toBe('Pinggan');
    facilityTestWeek($this->facility);
    app(SetFacilityPublicationAction::class)->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, 4), true);
    $this->put($base, ['revision' => 5, 'contact_phone' => '09123456789'], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->put($base, ['revision' => 6, 'address' => '', 'address_parts' => null], $headers)
        ->assertSessionHasErrors('location_name');
    expect($this->facility->fresh()->address)->toBe('Pinggan');
});

it('validates address parts and the combined length while allowing a draft address to be cleared', function () {
    facilityTestAddressCatalogue($this->gasan, $this->boac);
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage']);
    $this->actingAs($admin);
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $this->postJson('/api/facility', ['name' => 'Park', 'type' => 'park', 'address_parts' => ['barangay' => 'Isok I']], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('address_parts.barangay');
    $base = '/api/facility/'.$this->facility->id;
    $this->putJson($base, ['revision' => 0, 'address_parts' => ['barangay' => 'Isok I']], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('address_parts.barangay');
    $this->putJson($base, ['revision' => 0, 'address_parts' => ['barangay' => 'Retired barangay']], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('address_parts.barangay');
    $this->putJson($base, ['revision' => 0, 'address_parts' => ['barangay' => 'Pinggan', 'street' => str_repeat('x', 2000)]], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('address');
    $this->putJson($base, ['revision' => 0, 'address_parts' => ['municipal_id' => $this->boac->id]], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('address_parts');
    $this->put($base, ['revision' => 0, 'address_parts' => ['barangay' => 'Pinggan']], $headers)
        ->assertSessionHasNoErrors()->assertRedirect();
    $this->put($base, ['revision' => 1, 'address' => '', 'address_parts' => null], $headers)
        ->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->address)->toBeNull();
});

it('supplies only current municipality barangays to the facility form and excludes retired barangays', function () {
    $catalogue = facilityTestAddressCatalogue($this->gasan, $this->boac);
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage']);
    $this->actingAs($admin)->get('/'.$this->gasan->slug.'/admin/facility/create')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('address_barangays', 1)
            ->where('address_barangays.0.id', (string) $catalogue['pinggan'])->where('address_barangays.0.name', 'Pinggan')
            ->missing('address_provinces'));
});

it('keeps create and update request requirements distinct and rejects malformed address input', function () {
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage']);
    $this->actingAs($admin);
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $this->postJson('/api/facility', ['name' => 'Park', 'type' => 'park', 'revision' => 0], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('revision');
    $this->putJson('/api/facility/'.$this->facility->id, ['name' => 'Missing revision'], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('revision');
    $this->postJson('/api/facility', ['name' => 'Park', 'type' => 'park', 'address_parts' => ['street' => ['invalid']]], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('address_parts.street');
    expect($this->facility->fresh()->revision)->toBe(0)->and(Facility::count())->toBe(1);
});

it('sets publication explicitly through the publish endpoint without toggling repeated requests', function () {
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.publish']);
    $this->actingAs($admin);
    facilityTestWeek($this->facility);
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $url = route('api.facility.publish', ['facility' => $this->facility->id], false);
    expect($url)->toBe('/api/facility/'.$this->facility->id.'/publish');
    $this->patch($url, ['revision' => 1, 'is_published' => true], $headers)->assertSessionHasNoErrors()->assertRedirect();
    $this->patch($url, ['revision' => 2, 'is_published' => true], $headers)->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->is_published)->toBeTrue();
    $this->patch($url, ['revision' => 3, 'is_published' => false], $headers)->assertSessionHasNoErrors()->assertRedirect();
    expect($this->facility->fresh()->is_published)->toBeFalse();
});

it('provides an anonymous mobile list containing only published facilities from the selected municipality', function () {
    facilityTestPublish($this->facility);
    app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->gasan->id, ['name' => 'Draft park', 'type' => 'park']));
    $foreign = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->boac->id, ['name' => 'Boac Park', 'type' => 'park', 'location_name' => 'Plaza']));
    facilityTestPublish($foreign);
    $deleted = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->gasan->id, ['name' => 'Deleted park', 'type' => 'park', 'location_name' => 'Plaza']));
    facilityTestPublish($deleted);
    app(DeleteFacilityAction::class)->execute($deleted->id, new FacilityMutationDto($this->gasan->id, $deleted->fresh()->revision));

    $response = $this->getJson('/api/v1/facilities?publication=draft&municipal_id='.$this->boac->id, ['X-Municipality-Slug' => $this->gasan->slug]);
    $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $this->facility->id)
        ->assertJsonPath('meta.total', 1)->assertJsonPath('meta.per_page', 20)
        ->assertJsonStructure(['data' => [['id', 'name', 'type', 'location_name', 'address', 'image_url', 'availability', 'updated_at']], 'links', 'meta'])
        ->assertJsonMissingPath('data.0.weekly_days')->assertJsonMissingPath('data.0.exceptions')
        ->assertJsonMissingPath('data.0.municipal_id')->assertJsonMissingPath('data.0.revision')->assertJsonMissingPath('data.0.audit_log');
    expect($response->headers->get('Cache-Control'))->toContain('no-store');
});

it('returns the mobile detail contract with server calculated hours and no admin fields', function () {
    facilityTestPublish($this->facility);
    $response = $this->getJson('/api/v1/facilities/'.$this->facility->id, ['X-Municipality-Slug' => $this->gasan->slug]);
    $response->assertOk()->assertJsonPath('data.id', $this->facility->id)
        ->assertJsonPath('data.type.value', 'amusement_ride')->assertJsonCount(7, 'data.weekly_days')
        ->assertJsonPath('data.weekly_days.0.periods.0.opening_minute', 480)
        ->assertJsonPath('data.weekly_days.0.periods.0.closing_minute', 720)
        ->assertJsonPath('data.availability.is_open', true)->assertJsonPath('data.availability.status', 'open')
        ->assertJsonPath('data.availability.timezone', 'Asia/Manila')
        ->assertJsonPath('data.availability.closes_at', '2026-11-02T12:00:00+08:00')
        ->assertJsonStructure(['data' => ['description', 'contact_name', 'contact_phone', 'contact_email', 'exceptions', 'updated_at']])
        ->assertJsonMissingPath('data.municipal_id')->assertJsonMissingPath('data.is_published')
        ->assertJsonMissingPath('data.revision')->assertJsonMissingPath('data.audit_log')->assertJsonMissingPath('data.operating_status');
    expect($response->json('data.updated_at'))->toEndWith('+08:00')
        ->and($response->headers->get('Cache-Control'))->toContain('no-store');
});

it('hides draft deleted and foreign facility IDs from mobile detail endpoints', function () {
    $path = '/api/v1/facilities/'.$this->facility->id;
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $this->getJson($path, $headers)->assertNotFound();
    facilityTestPublish($this->facility);
    $this->getJson($path, ['X-Municipality-Slug' => $this->boac->slug])->assertNotFound();
    $this->getJson('/api/v1/facilities/not-a-ulid', $headers)->assertNotFound();
    $this->getJson($path, ['X-Municipality-Slug' => 'missing-town'])->assertForbidden();
    app(DeleteFacilityAction::class)->execute($this->facility->id, new FacilityMutationDto($this->gasan->id, $this->facility->fresh()->revision));
    $this->getJson($path, $headers)->assertNotFound();
});

it('exposes cancellations and indefinite delay holds through the mobile API', function () {
    facilityTestPublish($this->facility);
    facilityTestException($this->facility, ['notice_type' => 'cancelled', 'public_notice' => 'Heavy rain.']);
    $path = '/api/v1/facilities/'.$this->facility->id;
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $this->getJson($path, $headers)->assertOk()->assertJsonPath('data.availability.status', 'cancelled')
        ->assertJsonPath('data.availability.is_open', false)->assertJsonPath('data.availability.notice', 'Heavy rain.')
        ->assertJsonPath('data.availability.today_periods', [])->assertJsonPath('data.exceptions.0.notice_type', 'cancelled')
        ->assertJsonPath('data.weekly_days.0.periods.0.opening_minute', 480);
    app(SetFacilityOperatingStatusAction::class)->execute($this->facility->id, new FacilityOperatingStatusDto(
        $this->gasan->id, $this->facility->fresh()->revision, FacilityOperatingStatus::DELAYED, 'Awaiting repairs.',
        CarbonImmutable::parse('2026-11-02 09:00', 'Asia/Manila'),
    ));
    $this->getJson($path, $headers)->assertOk()->assertJsonPath('data.availability.status', 'delayed')
        ->assertJsonPath('data.availability.next_opens_at', null)->assertJsonPath('data.availability.notice', 'Awaiting repairs.')
        ->assertJsonPath('data.availability.expected_reopens_at', '2026-11-02T09:00:00+08:00');
    $this->getJson('/api/v1/facilities', $headers)->assertOk()->assertJsonPath('data.0.availability.status', 'delayed');
});

it('paginates and filters mobile facilities while preserving the web page size', function () {
    facilityTestPublish($this->facility);
    foreach (['Park A', 'Park B'] as $name) {
        $park = app(StoreFacilityAction::class)->execute(new StoreFacilityDto($this->gasan->id, ['name' => $name, 'type' => 'park', 'location_name' => 'Plaza']));
        facilityTestPublish($park);
    }
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $response = $this->getJson('/api/v1/facilities?type=park&search=Park&per_page=1', $headers);
    $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Park A')
        ->assertJsonPath('meta.total', 2)->assertJsonPath('meta.last_page', 2);
    $this->getJson($response->json('links.next'), $headers)->assertOk()->assertJsonPath('data.0.name', 'Park B')->assertJsonPath('meta.current_page', 2);
    expect(app(GetFacilitiesAction::class)->execute($this->gasan->id)->perPage())->toBe(12);
    foreach (['per_page=0', 'per_page=-1', 'per_page=51', 'per_page=abc', 'page=0', 'type=invalid'] as $query) {
        $this->getJson('/api/v1/facilities?'.$query, $headers)->assertUnprocessable();
    }
});

it('refreshes mobile availability across an opening boundary without treating updated_at as a status clock', function () {
    facilityTestPublish($this->facility);
    $path = '/api/v1/facilities/'.$this->facility->id;
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    Carbon::setTestNow(Carbon::parse('2026-11-02 07:59:59', 'Asia/Manila'));
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-02 07:59:59', 'Asia/Manila'));
    $closed = $this->getJson($path, $headers)->assertOk()->assertJsonPath('data.availability.is_open', false)
        ->assertJsonPath('data.availability.next_refresh_at', '2026-11-02T08:00:00+08:00');
    Carbon::setTestNow(Carbon::parse('2026-11-02 08:00:00', 'Asia/Manila'));
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-02 08:00:00', 'Asia/Manila'));
    $open = $this->getJson($path, $headers)->assertOk()->assertJsonPath('data.availability.is_open', true);
    expect($open->json('data.updated_at'))->toBe($closed->json('data.updated_at'));
});

it('does not expose facility mutations through the mobile API', function () {
    $headers = ['X-Municipality-Slug' => $this->gasan->slug];
    $this->postJson('/api/v1/facilities', ['name' => 'Forged park'], $headers)->assertStatus(405);
    $this->putJson('/api/v1/facilities/'.$this->facility->id, ['name' => 'Changed'], $headers)->assertStatus(405);
    $this->deleteJson('/api/v1/facilities/'.$this->facility->id, [], $headers)->assertStatus(405);
    expect($this->facility->fresh()->trashed())->toBeFalse();
});

it('does not offer another municipality barangays when the current municipality has no PSGC link', function () {
    facilityTestAddressCatalogue($this->gasan, $this->boac);
    $this->gasan->update(['psgc_municipal_id' => null]);
    $admin = facilityTestAdmin($this->gasan, ['facility.access', 'facility.view', 'facility.manage']);
    $this->actingAs($admin)->get('/'.$this->gasan->slug.'/admin/facility/create')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('address_barangays', 0));
    $this->postJson('/api/facility', ['name' => 'Park', 'type' => 'park', 'address_parts' => ['barangay' => 'Pinggan']],
        ['X-Municipality-Slug' => $this->gasan->slug])->assertUnprocessable()->assertJsonValidationErrors('address_parts.barangay');
});
