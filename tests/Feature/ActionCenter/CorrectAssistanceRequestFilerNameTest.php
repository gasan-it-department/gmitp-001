<?php

use App\Core\ActionCenter\Dto\Assistance\CorrectAssistanceRequestFilerNameDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\UseCase\Assistance\CorrectAssistanceRequestFilerNameAction;
use Illuminate\Auth\Access\AuthorizationException;
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

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('household_id');
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
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
        'users',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('applies a verified profile name to an approved snapshot without changing the amount or other frozen data', function () {
    $context = filerNameCorrectionContext(status: AssistanceStatus::Approved);

    $result = app(CorrectAssistanceRequestFilerNameAction::class)->execute(
        filerNameCorrectionDto($context, canCorrect: true),
    );

    $snapshot = DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $context['request_id'])
        ->first();

    expect($snapshot->first_name)->toBe('MARIA')
        ->and($snapshot->middle_name)->toBe('SANTOS')
        ->and($snapshot->last_name)->toBe('DELA CRUZ')
        ->and($snapshot->suffix)->toBe('JR.')
        ->and($snapshot->barangay)->toBe('BAHI')
        ->and((float) $result->amount_approved)->toBe(5000.0)
        ->and($result->status)->toBe(AssistanceStatus::Approved);

    $activity = DB::table('activity_log')->where('subject_id', $context['request_id'])->first();
    $properties = json_decode((string) $activity->properties, true);

    expect($activity->description)->toBe('Corrected frozen filer name from verified beneficiary profile')
        ->and($properties['old']['first_name'])->toBe('MARIE')
        ->and($properties['attributes']['first_name'])->toBe('MARIA')
        ->and($properties['correction_reason'])->toBe('Corrected spelling from the verified government ID.');
});

it('allows processing correction for pending and only the assigned under-review case', function () {
    $pending = filerNameCorrectionContext(status: AssistanceStatus::Pending);

    app(CorrectAssistanceRequestFilerNameAction::class)->execute(
        filerNameCorrectionDto($pending, canProcess: true),
    );

    expect(DB::table('ac_assistance_request_snapshots')->where('assistance_request_id', $pending['request_id'])->value('first_name'))
        ->toBe('MARIA');

    $underReview = filerNameCorrectionContext(status: AssistanceStatus::UnderReview);

    expect(fn () => app(CorrectAssistanceRequestFilerNameAction::class)->execute(
        filerNameCorrectionDto($underReview, actorId: (string) Str::ulid(), canProcess: true),
    ))->toThrow(AuthorizationException::class);
});

it('rejects unverified names, insufficient permissions, and released requests without writing the snapshot', function () {
    $unverified = filerNameCorrectionContext(status: AssistanceStatus::Approved, identityVerified: false);

    expect(fn () => app(CorrectAssistanceRequestFilerNameAction::class)->execute(
        filerNameCorrectionDto($unverified, canCorrect: true),
    ))->toThrow(DomainException::class, 'Verify the corrected beneficiary identity');

    $unauthorized = filerNameCorrectionContext(status: AssistanceStatus::Approved);

    expect(fn () => app(CorrectAssistanceRequestFilerNameAction::class)->execute(
        filerNameCorrectionDto($unauthorized),
    ))->toThrow(AuthorizationException::class);

    $released = filerNameCorrectionContext(status: AssistanceStatus::Released);

    expect(fn () => app(CorrectAssistanceRequestFilerNameAction::class)->execute(
        filerNameCorrectionDto($released, canCorrect: true),
    ))->toThrow(DomainException::class);

    foreach ([$unverified, $unauthorized, $released] as $context) {
        expect(DB::table('ac_assistance_request_snapshots')->where('assistance_request_id', $context['request_id'])->value('first_name'))
            ->toBe('MARIE');
    }
});

/** @return array{request_id: string, municipal_id: string, actor_id: string} */
function filerNameCorrectionContext(
    AssistanceStatus $status,
    bool $identityVerified = true,
): array {
    $now = now();
    $municipalId = (string) Str::ulid();
    $actorId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    $householdId = (string) Str::ulid();
    $requestId = (string) Str::ulid();

    DB::table('users')->insert([
        'id' => $actorId,
        'first_name' => 'MSWD',
        'last_name' => 'ADMIN',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'municipal_id' => $municipalId,
        'household_id' => $householdId,
        'first_name' => 'MARIA',
        'middle_name' => 'SANTOS',
        'last_name' => 'DELA CRUZ',
        'suffix' => 'JR.',
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
        'reviewed_by_user_id' => $status === AssistanceStatus::UnderReview ? $actorId : null,
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

/** @param array{request_id: string, municipal_id: string, actor_id: string} $context */
function filerNameCorrectionDto(
    array $context,
    ?string $actorId = null,
    bool $canProcess = false,
    bool $canCorrect = false,
): CorrectAssistanceRequestFilerNameDto {
    return new CorrectAssistanceRequestFilerNameDto(
        assistanceRequestId: $context['request_id'],
        municipalId: $context['municipal_id'],
        correctedByUserId: $actorId ?? $context['actor_id'],
        reason: 'Corrected spelling from the verified government ID.',
        canProcessRequests: $canProcess,
        canCorrectRequests: $canCorrect,
    );
}
