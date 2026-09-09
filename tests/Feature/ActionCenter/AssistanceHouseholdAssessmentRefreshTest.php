<?php

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Assistance\RefreshAssistanceHouseholdAssessmentAction;
use App\External\Api\Resources\ActionCenter\ActivityLogResource;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

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
        $table->ulid('released_by_user_id')->nullable();
        $table->string('release_reference_number')->nullable();
        $table->string('status');
        $table->string('mswd_verification_status')->nullable();
        $table->ulid('mswd_verified_by_user_id')->nullable();
        $table->timestamp('mswd_verified_at')->nullable();
        $table->text('mswd_verification_notes')->nullable();
        $table->string('mswd_verification_fingerprint')->nullable();
        $table->json('metadata')->nullable();
        $table->timestamp('released_at')->nullable();
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
        'mswd_verification_status' => 'pending',
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

    refreshHouseholdAssessment(
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

it('does not report a changed income when JSON only changes its numeric representation', function () {
    refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
    );

    $preview = householdAssessmentPreview($this->requestId);

    expect($preview['added'])->toBe([])
        ->and($preview['removed'])->toBe([])
        ->and($preview['changed'])->toBe([]);
});

it('rejects a repeated synchronization when the assessed household has not changed', function () {
    refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
    );

    $assessmentBefore = data_get(requestMetadata($this->requestId), 'household_assessment_snapshot');
    $activityCountBefore = DB::table('activity_log')->count();

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
    ))->toThrow(DomainException::class, 'The household assessment is already up to date.');

    expect(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBe($assessmentBefore)
        ->and(DB::table('activity_log')->count())->toBe($activityCountBefore);
});

it('rejects synchronization for every unsupported request status', function (string $status) {
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => $status,
    ]);

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
    ))->toThrow(DomainException::class, 'under review or approved')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();
})->with(['pending', 'released', 'rejected', 'cancelled']);

it('preserves under-review processing and assigned-reviewer restrictions', function () {
    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: (string) Str::ulid(),
    ))->toThrow(DomainException::class, 'assigned to this case')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
        canProcessRequests: false,
    ))->toThrow(AuthorizationException::class, 'not authorized')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();
});

it('lets a correction-authorized administrator refresh an approved unreleased household without changing the filing snapshot', function () {
    $correctorId = (string) Str::ulid();
    DB::table('users')->insert([
        'id' => $correctorId,
        'first_name' => 'Correction',
        'last_name' => 'Administrator',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => 'approved',
        'mswd_verification_status' => 'verified',
        'updated_at' => now(),
    ]);
    DB::table('ac_household_members')->where('id', $this->headMemberId)->update([
        'monthly_income' => 5500,
        'updated_at' => now(),
    ]);

    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $this->householdId,
        'first_name' => 'MIGUEL',
        'last_name' => 'MAWAC',
        'relationship' => 'child',
        'birth_date' => '2014-09-12',
        'sex' => 'male',
        'monthly_income' => 0,
        'is_active' => true,
        'is_verified_dependent' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $updated = refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $correctorId,
        canProcessRequests: false,
        canCorrectRequests: true,
        correctionReason: 'MSWD interview confirmed the current household roster and income details.',
    );

    $metadata = requestMetadata($this->requestId);
    $audit = json_decode(
        DB::table('activity_log')
            ->where('description', 'Corrected completed household assessment')
            ->value('properties'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );
    $auditPayload = (new ActivityLogResource(
        Activity::query()
            ->where('description', 'Corrected completed household assessment')
            ->with('causer')
            ->firstOrFail(),
    ))->resolve();

    expect($updated->status->value)->toBe('approved')
        ->and($metadata['household_composition_snapshot'])->toBe($this->filingSnapshot)
        ->and($metadata['household_assessment_snapshot'])->toMatchArray([
            'household_id' => $this->householdId,
            'captured_by_user_id' => $correctorId,
            'source' => 'approved_correction',
        ])
        ->and($metadata['household_assessment_snapshot']['members'])->toHaveCount(2)
        ->and((float) $metadata['household_assessment_snapshot']['members'][0]['monthly_income'])->toBe(5500.0)
        ->and(data_get($audit, 'old.household_assessment_snapshot'))->toBe($this->filingSnapshot)
        ->and(data_get($audit, 'attributes.household_assessment_snapshot.source'))->toBe('approved_correction')
        ->and(data_get($audit, 'correction_reason'))->toBe('MSWD interview confirmed the current household roster and income details.')
        ->and(data_get($auditPayload, 'changes.household_assessment_snapshot.source'))->toBe('approved_correction')
        ->and($auditPayload['reason'])->toBe('MSWD interview confirmed the current household roster and income details.');

    DB::table('ac_household_members')->where('id', $this->headMemberId)->update([
        'monthly_income' => 6000,
        'updated_at' => now(),
    ]);
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'mswd_verification_status' => 'verified',
        'updated_at' => now(),
    ]);

    refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $correctorId,
        canProcessRequests: false,
        canCorrectRequests: true,
        correctionReason: 'MSWD interview corrected the household head monthly income after approval.',
    );

    expect(DB::table('activity_log')
        ->where('description', 'Corrected completed household assessment')
        ->count())->toBe(2);
});

it('blocks approved synchronization without correction permission or a valid reason', function () {
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => 'approved',
        'mswd_verification_status' => 'verified',
        'updated_at' => now(),
    ]);

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
        canProcessRequests: true,
        canCorrectRequests: false,
    ))->toThrow(AuthorizationException::class, 'not authorized')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
        canProcessRequests: false,
        canCorrectRequests: true,
        correctionReason: 'Too short',
    ))->toThrow(DomainException::class, '10 to 1,000 characters');

});

it('lets the assigned MSWD reviewer synchronize an approved request awaiting verification', function () {
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => 'approved',
        'mswd_verification_status' => 'pending',
        'updated_at' => now(),
    ]);

    $updated = refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
        canProcessRequests: true,
        canCorrectRequests: false,
    );

    expect($updated->status->value)->toBe('approved')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot.source'))->toBe('mswd_interview');
});

it('blocks approved synchronization when any release artifact already exists', function (string $column, mixed $value) {
    DB::table('ac_assistance_requests')->where('id', $this->requestId)->update([
        'status' => 'approved',
        $column => $value,
        'updated_at' => now(),
    ]);

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
        canProcessRequests: false,
        canCorrectRequests: true,
        correctionReason: 'MSWD attempted a correction after release details were entered.',
    ))->toThrow(DomainException::class, 'release data')
        ->and(data_get(requestMetadata($this->requestId), 'household_assessment_snapshot'))->toBeNull();
})->with([
    'release timestamp' => ['released_at', now()],
    'releasing user' => ['released_by_user_id', (string) Str::ulid()],
    'release reference' => ['release_reference_number', 'DV-2026-001'],
]);

it('rejects a stale household preview before it writes an assessment', function () {
    $fingerprint = householdAssessmentFingerprint($this->requestId);

    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $this->householdId,
        'first_name' => 'LIZA',
        'last_name' => 'MAWAC',
        'relationship' => 'child',
        'birth_date' => '2010-01-08',
        'sex' => 'female',
        'monthly_income' => 0,
        'is_active' => true,
        'is_verified_dependent' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => refreshHouseholdAssessment(
        assistanceRequestId: $this->requestId,
        municipalId: $this->municipalId,
        actingUserId: $this->reviewerId,
        expectedFingerprint: $fingerprint,
    ))->toThrow(DomainException::class, 'changed while you were reviewing')
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

function householdAssessmentFingerprint(string $requestId): string
{
    return householdAssessmentPreview($requestId)['fingerprint'];
}

/** @return array{fingerprint: string, previous_source: string, added: list<array<string, mixed>>, removed: list<array<string, mixed>>, changed: list<array<string, mixed>>, current_member_count: int} */
function householdAssessmentPreview(string $requestId): array
{
    $request = AssistanceRequest::query()->findOrFail($requestId);
    $members = HouseholdMember::query()
        ->where('household_id', $request->household_id)
        ->where('is_active', true)
        ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
        ->orderBy('created_at')
        ->get();

    return app(RefreshAssistanceHouseholdAssessmentAction::class)
        ->preview($request, $members);
}

function refreshHouseholdAssessment(
    string $assistanceRequestId,
    string $municipalId,
    string $actingUserId,
    bool $canProcessRequests = true,
    bool $canCorrectRequests = false,
    ?string $correctionReason = null,
    ?string $expectedFingerprint = null,
): AssistanceRequest {
    return app(RefreshAssistanceHouseholdAssessmentAction::class)->execute(
        assistanceRequestId: $assistanceRequestId,
        municipalId: $municipalId,
        actingUserId: $actingUserId,
        canProcessRequests: $canProcessRequests,
        canCorrectRequests: $canCorrectRequests,
        correctionReason: $correctionReason,
        expectedFingerprint: $expectedFingerprint ?? householdAssessmentFingerprint($assistanceRequestId),
    );
}
