<?php

use App\Core\ActionCenter\UseCase\Assistance\RefreshAssistanceHouseholdAssessmentAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->string('barangay');
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('municipal_id');
        $table->boolean('is_active')->default(true);
        $table->string('first_name');
        $table->string('last_name');
        $table->date('birth_date');
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('relationship');
        $table->date('birth_date')->nullable();
        $table->string('sex')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->ulid('religion_id')->nullable();
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->string('status');
        $table->json('metadata')->nullable();
        $table->softDeletes();
        $table->timestamps();
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

    $this->municipalId = (string) Str::ulid();
    $this->reviewerId = (string) Str::ulid();
    $this->householdId = (string) Str::ulid();
    $this->beneficiaryId = (string) Str::ulid();
    $this->requestId = (string) Str::ulid();
    $this->headMemberId = (string) Str::ulid();

    DB::table('users')->insert([
        'id' => $this->reviewerId,
        'first_name' => 'Assigned',
        'last_name' => 'Reviewer',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_households')->insert([
        'id' => $this->householdId,
        'municipal_id' => $this->municipalId,
        'household_code' => 'HH-GAS-0001',
        'barangay' => 'Bachao Ilaya',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $this->beneficiaryId,
        'household_id' => $this->householdId,
        'municipal_id' => $this->municipalId,
        'is_active' => true,
        'first_name' => 'APRIL JOY',
        'last_name' => 'MAWAC',
        'birth_date' => '1990-06-14',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_household_members')->insert([
        'id' => $this->headMemberId,
        'household_id' => $this->householdId,
        'beneficiary_id' => $this->beneficiaryId,
        'first_name' => 'APRIL JOY',
        'last_name' => 'MAWAC',
        'relationship' => 'head',
        'birth_date' => '1990-06-14',
        'sex' => 'female',
        'occupation' => 'VENDOR',
        'monthly_income' => 3000,
        'is_active' => true,
        'is_verified_dependent' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->filingSnapshot = [
        'household_id' => $this->householdId,
        'captured_at' => '2026-08-27T09:00:00+08:00',
        'members' => [],
    ];

    DB::table('ac_assistance_requests')->insert([
        'id' => $this->requestId,
        'municipal_id' => $this->municipalId,
        'beneficiary_id' => $this->beneficiaryId,
        'household_id' => $this->householdId,
        'reviewed_by_user_id' => $this->reviewerId,
        'status' => 'under_review',
        'metadata' => json_encode([
            'household_composition_snapshot' => $this->filingSnapshot,
        ], JSON_THROW_ON_ERROR),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
});

afterEach(function () {
    foreach ([
        'activity_log',
        'ac_assistance_requests',
        'ac_household_members',
        'ac_beneficiaries',
        'ac_households',
        'users',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('captures the current roster after profile edits while preserving the filing snapshot', function () {
    DB::table('ac_household_members')->where('id', $this->headMemberId)->update([
        'occupation' => 'FARMER',
        'monthly_income' => 4500,
        'updated_at' => now(),
    ]);
    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $this->householdId,
        'first_name' => 'JUAN',
        'last_name' => 'MAWAC',
        'relationship' => 'child',
        'birth_date' => '2012-03-04',
        'sex' => 'male',
        'occupation' => null,
        'monthly_income' => 0,
        'is_active' => true,
        'is_verified_dependent' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    app(RefreshAssistanceHouseholdAssessmentAction::class)->execute(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
    );

    $metadata = json_decode(
        DB::table('ac_assistance_requests')->where('id', $this->requestId)->value('metadata'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect(DB::table('ac_household_members')->where('household_id', $this->householdId)->count())->toBe(2)
        ->and($metadata['household_composition_snapshot'])->toBe($this->filingSnapshot)
        ->and($metadata['household_assessment_snapshot'])->toMatchArray([
            'household_id' => $this->householdId,
            'captured_by_user_id' => $this->reviewerId,
            'source' => 'mswd_interview',
        ])
        ->and($metadata['household_assessment_snapshot']['members'])->toHaveCount(2)
        ->and($metadata['household_assessment_snapshot']['members'][0])->toMatchArray([
            'occupation' => 'FARMER',
            'monthly_income' => 4500.0,
        ])
        ->and(DB::table('activity_log')
            ->where('description', 'Updated household assessment during assistance interview')
            ->exists())->toBeTrue();
});

it('blocks assessment refresh outside review or by an unassigned worker', function () {
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => 'approved',
    ]);

    expect(fn () => app(RefreshAssistanceHouseholdAssessmentAction::class)->execute(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
    ))->toThrow(DomainException::class, 'only be updated')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();

    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => 'under_review',
    ]);

    expect(fn () => app(RefreshAssistanceHouseholdAssessmentAction::class)->execute(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: (string) Str::ulid(),
    ))->toThrow(DomainException::class, 'assigned to this case')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();
});

/** @return array<string, mixed> */
function requestMetadata(string $requestId): array
{
    return json_decode(
        DB::table('ac_assistance_requests')->where('id', $requestId)->value('metadata'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );
}
