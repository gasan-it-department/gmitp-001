<?php

use App\Core\ActionCenter\Dto\Household\UpdateHouseholdAddressDto;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Household\UpdateHouseholdAddressAction;
use App\Core\Users\Models\Permission;
use App\Core\Users\Models\User;
use App\Http\Middleware\Admin\AdminGuardMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Municipality\SetMunicipalityContext;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->enableLogging();
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('psgc_municipal_id')->nullable();
    });
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name');
        $table->string('last_name');
        $table->timestamps();
    });
    Schema::create('psgc_barangays', function (Blueprint $table) {
        $table->id();
        $table->string('municipality_id');
        $table->string('psgc_code');
        $table->string('name');
    });
    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code');
        $table->string('barangay');
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->string('status');
        $table->decimal('amount', 10, 2);
        $table->json('metadata');
    });
    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id');
        $table->string('barangay');
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
    });
    Schema::create('activity_log', function (Blueprint $table) {
        $table->id();
        $table->string('log_name')->nullable();
        $table->text('description');
        $table->nullableUlidMorphs('subject');
        $table->nullableUlidMorphs('causer');
        $table->json('properties')->nullable();
        $table->json('attribute_changes')->nullable();
        $table->string('event')->nullable();
        $table->uuid('batch_uuid')->nullable();
        $table->timestamps();
    });
    (require database_path('migrations/2025_12_16_160234_create_permission_tables.php'))->up();
    foreach (['action_center.access', 'action_center.beneficiaries.correct', 'action_center.beneficiaries.manage'] as $permission) {
        Permission::create(['name' => $permission, 'guard_name' => 'web']);
    }
    $this->municipalId = (string) Str::ulid();
    DB::table('municipalities')->insert(['id' => $this->municipalId, 'psgc_municipal_id' => '4905']);
    DB::table('psgc_barangays')->insert([
        ['municipality_id' => '4905', 'psgc_code' => '490501', 'name' => 'Uno'],
        ['municipality_id' => '4905', 'psgc_code' => '490502', 'name' => 'Dos'],
        ['municipality_id' => '4906', 'psgc_code' => '490601', 'name' => 'Other barangay'],
    ]);
    $this->actor = User::create(['id' => (string) Str::ulid(), 'first_name' => 'Address', 'last_name' => 'Reviewer']);
    $this->household = Household::create(['municipal_id' => $this->municipalId,
        'household_code' => 'HH-GAS-1', 'barangay' => 'Uno', 'barangay_psgc_code' => '490501', 'street' => 'Old street']);
    $this->addressData = ['barangay_code' => '490502', 'street' => '  Corrected street  ',
        'reason' => '  Wrong address encoded  ', 'expected_fingerprint' => $this->household->addressFingerprint()];
    $this->url = '/api/action-center/households/'.$this->household->id.'/address';
    app()->instance('municipal_id', $this->municipalId);
    $this->actor->givePermissionTo(['action_center.access', 'action_center.beneficiaries.correct']);
    $this->withoutMiddleware([AdminGuardMiddleware::class, SetMunicipalityContext::class, HandleInertiaRequests::class]);
    $this->actingAs($this->actor);
});

afterEach(function () {
    (require database_path('migrations/2025_12_16_160234_create_permission_tables.php'))->down();
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    foreach (['activity_log', 'ac_assistance_request_snapshots', 'ac_assistance_requests', 'ac_households', 'psgc_barangays', 'users', 'municipalities'] as $table) {
        Schema::dropIfExists($table);
    }
});

function correctHouseholdAddress(object $test, array $changes = []): Household
{
    $data = array_replace($test->addressData, $changes);

    return app(UpdateHouseholdAddressAction::class)->execute(new UpdateHouseholdAddressDto(
        householdId: $test->household->id, municipalId: $test->municipalId, actingAdminId: $test->actor->id,
        barangayCode: $data['barangay_code'], street: $data['street'], reason: $data['reason'],
        expectedFingerprint: $data['expected_fingerprint'],
    ));
}

it('corrects the shared address and audits the actor reason and previous values', function () {
    $this->from('/household-profile')->put($this->url, $this->addressData)
        ->assertRedirect('/household-profile')->assertSessionHasNoErrors();
    expect($this->household->fresh()->only(['barangay', 'barangay_psgc_code', 'street']))
        ->toBe(['barangay' => 'Dos', 'barangay_psgc_code' => '490502', 'street' => 'Corrected street']);
    $log = DB::table('activity_log')->where('log_name', 'household-address')->first();
    $properties = json_decode($log->properties, true);
    expect($log->subject_type)->toBe('household')->and($log->subject_id)->toBe($this->household->id)
        ->and($log->causer_id)->toBe($this->actor->id)->and($properties['municipal_id'])->toBe($this->municipalId)
        ->and($properties['old']['street'])->toBe('Old street')
        ->and($properties['attributes']['barangay'])->toBe('Dos')->and($properties['reason'])->toBe('Wrong address encoded');
});

it('preserves every pending approved and released request and its address snapshot', function () {
    foreach (['pending', 'approved', 'released'] as $status) {
        $requestId = (string) Str::ulid();
        DB::table('ac_assistance_requests')->insert(['id' => $requestId, 'household_id' => $this->household->id,
            'status' => $status, 'amount' => '2000.00', 'metadata' => json_encode(['filer_relationships' => ['source' => 'filer_answers']])]);
        DB::table('ac_assistance_request_snapshots')->insert(['id' => (string) Str::ulid(), 'assistance_request_id' => $requestId,
            'barangay' => 'Uno', 'barangay_psgc_code' => '490501', 'street' => 'Old street']);
    }
    $requests = DB::table('ac_assistance_requests')->orderBy('id')->get()->toJson();
    $snapshots = DB::table('ac_assistance_request_snapshots')->orderBy('id')->get()->toJson();
    correctHouseholdAddress($this);
    expect(DB::table('ac_assistance_requests')->orderBy('id')->get()->toJson())->toBe($requests)
        ->and(DB::table('ac_assistance_request_snapshots')->orderBy('id')->get()->toJson())->toBe($snapshots);
});

it('rejects foreign and unknown barangay codes without changing the address', function (string $code) {
    expect(fn () => correctHouseholdAddress($this, ['barangay_code' => $code]))
        ->toThrow(DomainException::class, 'Select a barangay belonging to this municipality.');
    expect($this->household->fresh()->street)->toBe('Old street')->and(DB::table('activity_log')->count())->toBe(0);
})->with(['490601', 'not-a-barangay']);

it('rejects another municipality household and deleted households', function (bool $deleted) {
    if ($deleted) {
        $this->household->delete();
    } else {
        $this->household->update(['municipal_id' => (string) Str::ulid()]);
    }
    expect(fn () => correctHouseholdAddress($this))->toThrow(ModelNotFoundException::class);
    expect(DB::table('activity_log')->count())->toBe(0);
})->with([false, true]);

it('rejects stale edits without overwriting the newer address', function () {
    $this->household->update(['street' => 'Newer edit']);
    $this->from('/household-profile')->put($this->url, $this->addressData)
        ->assertSessionHasErrors('household_address');
    expect($this->household->fresh()->street)->toBe('Newer edit')->and(DB::table('activity_log')->count())->toBe(0);
});

it('requires correction permission even for a beneficiary manager', function (array $capabilities) {
    $this->actor->syncPermissions($capabilities);
    $this->putJson($this->url, $this->addressData)->assertForbidden();
    expect($this->household->fresh()->street)->toBe('Old street')->and(DB::table('activity_log')->count())->toBe(0);
})->with([
    [['action_center.access', 'action_center.beneficiaries.manage']],
    [['action_center.beneficiaries.correct']],
]);

it('requires a reason a selected barangay and the reviewed fingerprint', function (string $field, mixed $value) {
    $this->putJson($this->url, array_replace($this->addressData, [$field => $value]))->assertUnprocessable()->assertJsonValidationErrors($field);
    expect($this->household->fresh()->street)->toBe('Old street');
})->with([['reason', '   '], ['barangay_code', ''], ['street', str_repeat('x', 256)], ['expected_fingerprint', 'forged']]);

it('resolves names from the local catalog and ignores forged household fields', function () {
    $this->put($this->url, [...$this->addressData, 'barangay' => 'Forged name', 'municipal_id' => 'wrong', 'household_code' => 'changed'])
        ->assertSessionHasNoErrors();
    expect($this->household->fresh()->barangay)->toBe('Dos')->and($this->household->fresh()->municipal_id)->toBe($this->municipalId)
        ->and($this->household->fresh()->household_code)->toBe('HH-GAS-1');
});

it('supports clearing the optional street and does not log unchanged saves', function () {
    $updated = correctHouseholdAddress($this, ['street' => '  ']);
    expect($updated->street)->toBeNull()->and(DB::table('activity_log')->count())->toBe(1);
    correctHouseholdAddress($this, ['street' => null, 'expected_fingerprint' => $updated->addressFingerprint()]);
    expect(DB::table('activity_log')->count())->toBe(1);
});

it('rolls back the address when the audit cannot be stored', function () {
    Schema::drop('activity_log');
    expect(fn () => correctHouseholdAddress($this))->toThrow(\Illuminate\Database\QueryException::class);
    expect($this->household->fresh()->street)->toBe('Old street');
});
