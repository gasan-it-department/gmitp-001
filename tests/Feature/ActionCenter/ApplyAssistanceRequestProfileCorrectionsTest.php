<?php

use App\Core\ActionCenter\Dto\Assistance\ApplyAssistanceRequestProfileCorrectionsDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\MswdVerificationStatus;
use App\Core\ActionCenter\UseCase\Assistance\ApplyAssistanceRequestProfileCorrectionsAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
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

    Schema::create('ac_religions', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('household_id');
        $table->ulid('religion_id')->nullable();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->nullable();
        $table->timestamp('identity_verified_at')->nullable();
        $table->ulid('identity_verified_by_user_id')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->string('mswd_verification_status')->nullable();
        $table->ulid('mswd_verified_by_user_id')->nullable();
        $table->timestamp('mswd_verified_at')->nullable();
        $table->text('mswd_verification_notes')->nullable();
        $table->string('mswd_verification_fingerprint', 64)->nullable();
        $table->ulid('released_by_user_id')->nullable();
        $table->string('release_reference_number', 60)->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->json('metadata')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id')->unique();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('religion')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->nullable();
        $table->string('barangay')->nullable();
        $table->timestamps();
    });

    Schema::create('activity_log', function (Blueprint $table) {
        $table->id();
        $table->string('log_name')->nullable()->index();
        $table->text('description');
        $table->nullableUlidMorphs('subject');
        $table->string('event')->nullable();
        $table->nullableUlidMorphs('causer');
        $table->json('attribute_changes')->nullable();
        $table->json('properties')->nullable();
        $table->timestamps();
    });
});

afterEach(function () {
    foreach ([
        'activity_log',
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_beneficiaries',
        'ac_religions',
        'users',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('applies only selected verified profile corrections without changing the request decision', function () {
    $context = profileCorrectionContext(status: AssistanceStatus::Approved);

    $result = app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($context, fields: ['birth_date'], canCorrect: true),
    );

    $snapshot = DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $context['request_id'])
        ->first();

    expect(Carbon::parse($snapshot->birth_date)->toDateString())->toBe('1988-05-12')
        ->and($snapshot->first_name)->toBe('MARIE')
        ->and($snapshot->occupation)->toBe('OLD OCCUPATION')
        ->and((float) $result->amount_approved)->toBe(5000.0)
        ->and($result->status)->toBe(AssistanceStatus::Approved);

    $activity = DB::table('activity_log')->where('subject_id', $context['request_id'])->first();
    $properties = json_decode((string) $activity->properties, true);

    expect($activity->description)->toBe('Applied verified beneficiary profile corrections to frozen claimant snapshot')
        ->and($properties['old']['birth_date'])->toBe('1990-01-01')
        ->and($properties['attributes']['birth_date'])->toBe('1988-05-12')
        ->and($properties['corrected_fields'])->toBe(['birth_date'])
        ->and($properties['correction_reason'])->toBe('Corrected the birth date from the verified government ID.');
});

it('allows pending processing and only the assigned reviewer for under-review corrections', function () {
    $pending = profileCorrectionContext(status: AssistanceStatus::Pending);

    app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($pending, fields: ['birth_date'], canProcess: true),
    );

    $correctedBirthDate = DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $pending['request_id'])
        ->value('birth_date');

    expect(Carbon::parse($correctedBirthDate)->toDateString())->toBe('1988-05-12');

    $underReview = profileCorrectionContext(status: AssistanceStatus::UnderReview);

    expect(fn () => app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto(
            $underReview,
            fields: ['birth_date'],
            actorId: (string) Str::ulid(),
            canProcess: true,
        ),
    ))->toThrow(AuthorizationException::class);
});

it('reopens completed verification when a correction-authorized user changes the snapshot', function () {
    $context = profileCorrectionContext(
        status: AssistanceStatus::Approved,
        verificationStatus: MswdVerificationStatus::Verified,
    );

    $result = app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($context, fields: ['birth_date', 'occupation'], canCorrect: true),
    );

    expect($result->mswd_verification_status)->toBe(MswdVerificationStatus::UnderReview)
        ->and($result->mswd_verified_at)->toBeNull()
        ->and($result->mswd_verified_by_user_id)->toBeNull()
        ->and($result->mswd_verification_fingerprint)->toBeNull()
        ->and($result->mswd_verification_notes)->toContain('Claimant snapshot corrected');
});

it('rejects unverified profiles unsupported fields insufficient permissions and released requests', function () {
    $unverified = profileCorrectionContext(status: AssistanceStatus::Pending, identityVerified: false);

    expect(fn () => app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($unverified, fields: ['birth_date'], canProcess: true),
    ))->toThrow(DomainException::class, 'Verify the corrected beneficiary profile');

    $unsupported = profileCorrectionContext(status: AssistanceStatus::Pending);
    expect(fn () => app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($unsupported, fields: ['household_id'], canProcess: true),
    ))->toThrow(DomainException::class, 'supported beneficiary profile correction');

    $unauthorized = profileCorrectionContext(status: AssistanceStatus::Approved);
    expect(fn () => app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($unauthorized, fields: ['birth_date']),
    ))->toThrow(AuthorizationException::class);

    $released = profileCorrectionContext(status: AssistanceStatus::Released);
    expect(fn () => app(ApplyAssistanceRequestProfileCorrectionsAction::class)->execute(
        profileCorrectionDto($released, fields: ['birth_date'], canCorrect: true),
    ))->toThrow(DomainException::class);
});

/** @return array{request_id:string,municipal_id:string,actor_id:string} */
function profileCorrectionContext(
    AssistanceStatus $status,
    bool $identityVerified = true,
    MswdVerificationStatus $verificationStatus = MswdVerificationStatus::Pending,
): array {
    $now = now();
    $municipalId = (string) Str::ulid();
    $actorId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    $householdId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $religionId = (string) Str::ulid();

    DB::table('users')->insert([
        'id' => $actorId,
        'first_name' => 'MSWD',
        'last_name' => 'ADMIN',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_religions')->insert([
        'id' => $religionId,
        'name' => 'Roman Catholic',
        'is_active' => true,
        'sort_order' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'municipal_id' => $municipalId,
        'household_id' => $householdId,
        'religion_id' => $religionId,
        'first_name' => 'MARIA',
        'middle_name' => 'SANTOS',
        'last_name' => 'DELA CRUZ',
        'suffix' => 'JR.',
        'sex' => 'female',
        'birth_date' => '1988-05-12',
        'educational_attainment' => 'college_grad',
        'civil_status' => 'married',
        'occupation' => 'STORE OWNER',
        'monthly_income' => 12000,
        'identity_verified_at' => $identityVerified ? $now : null,
        'identity_verified_by_user_id' => $identityVerified ? $actorId : null,
        'is_active' => true,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'beneficiary_id' => $beneficiaryId,
        'household_id' => $householdId,
        'assistance_type_id' => (string) Str::ulid(),
        'reviewed_by_user_id' => $status === AssistanceStatus::UnderReview || $verificationStatus === MswdVerificationStatus::Verified
            ? $actorId
            : null,
        'reviewed_at' => $status === AssistanceStatus::UnderReview || $verificationStatus === MswdVerificationStatus::Verified ? $now : null,
        'mswd_verification_status' => $verificationStatus->value,
        'mswd_verified_by_user_id' => $verificationStatus === MswdVerificationStatus::Verified ? $actorId : null,
        'mswd_verified_at' => $verificationStatus === MswdVerificationStatus::Verified ? $now : null,
        'mswd_verification_fingerprint' => $verificationStatus === MswdVerificationStatus::Verified ? hash('sha256', 'old') : null,
        'released_by_user_id' => $status === AssistanceStatus::Released ? $actorId : null,
        'release_reference_number' => $status === AssistanceStatus::Released ? 'DV-001' : null,
        'amount_approved' => 5000,
        'transaction_number' => 'REQ-'.Str::random(10),
        'status' => $status->value,
        'released_at' => $status === AssistanceStatus::Released ? $now : null,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => 'MARIE',
        'middle_name' => null,
        'last_name' => 'DELA CRUZ',
        'suffix' => null,
        'sex' => 'female',
        'birth_date' => '1990-01-01',
        'educational_attainment' => 'hs_grad',
        'religion' => 'Roman Catholic',
        'civil_status' => 'single',
        'occupation' => 'OLD OCCUPATION',
        'monthly_income' => 5000,
        'barangay' => 'BAHI',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return [
        'request_id' => $requestId,
        'municipal_id' => $municipalId,
        'actor_id' => $actorId,
    ];
}

/** @param array{request_id:string,municipal_id:string,actor_id:string} $context @param list<string> $fields */
function profileCorrectionDto(
    array $context,
    array $fields,
    ?string $actorId = null,
    bool $canProcess = false,
    bool $canCorrect = false,
): ApplyAssistanceRequestProfileCorrectionsDto {
    return new ApplyAssistanceRequestProfileCorrectionsDto(
        assistanceRequestId: $context['request_id'],
        municipalId: $context['municipal_id'],
        correctedByUserId: $actorId ?? $context['actor_id'],
        fields: $fields,
        reason: 'Corrected the birth date from the verified government ID.',
        canProcessRequests: $canProcess,
        canCorrectRequests: $canCorrect,
    );
}
