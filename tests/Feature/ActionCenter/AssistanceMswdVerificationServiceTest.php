<?php

use App\Core\ActionCenter\Dto\Assistance\ReplaceAssistanceAdditionalDocumentDto;
use App\Core\ActionCenter\Enums\AssistanceRequestDocumentCheckStatus;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\MswdVerificationStatus;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;
use App\Core\ActionCenter\UseCase\Assistance\ReplaceAssistanceAdditionalDocumentAction;
use App\Core\Users\Enums\EnumPermissions;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    activity()->disableLogging();
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');

    Schema::create('municipalities', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->string('municipal_code')->nullable();
        $table->timestamps();
    });

    Schema::create('users', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->nullable();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('user_name')->nullable();
        $table->timestamp('deactivated_at')->nullable();
        $table->timestamps();
    });

    // The Gate super-admin callback asks HasRoles whether this user has a
    // role before the test-specific permission ability runs.
    Schema::create('roles', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
    });
    Schema::create('permissions', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
    });
    Schema::create('model_has_permissions', function (Blueprint $table): void {
        $table->ulid('permission_id');
        $table->string('model_type');
        $table->ulid('model_id');
    });
    Schema::create('model_has_roles', function (Blueprint $table): void {
        $table->ulid('role_id');
        $table->string('model_type');
        $table->ulid('model_id');
    });
    Schema::create('role_has_permissions', function (Blueprint $table): void {
        $table->ulid('permission_id');
        $table->ulid('role_id');
    });

    Schema::create('ac_assistance_types', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('cooldown_months')->default(0);
        $table->string('cooldown_type')->default('per_request');
        $table->string('cooldown_scope')->default('per_beneficiary');
        $table->boolean('is_independent')->default(false);
        $table->decimal('min_amount', 10, 2)->nullable();
        $table->decimal('max_amount', 10, 2)->nullable();
        $table->unsignedInteger('sort_order')->default(0);
        $table->json('enabled_generated_documents')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_document_types', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->nullable();
        $table->string('key')->unique();
        $table->string('label');
        $table->text('description')->nullable();
        $table->json('examples')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_assistance_type_documents', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('assistance_type_id');
        $table->ulid('document_type_id');
        $table->boolean('is_required')->default(true);
        $table->string('physical_copy_requirement')->default('unspecified');
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('municipal_id');
        $table->boolean('is_active')->default(true);
        $table->string('first_name');
        $table->string('last_name');
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->timestamp('identity_verified_at')->nullable();
        $table->ulid('identity_verified_by_user_id')->nullable();
        $table->timestamp('intake_rejected_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->ulid('mswd_verified_by_user_id')->nullable();
        $table->ulid('released_by_user_id')->nullable();
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->string('mswd_verification_status')->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->string('release_reference_number', 60)->nullable();
        $table->json('metadata')->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->timestamp('mswd_verified_at')->nullable();
        $table->text('mswd_verification_notes')->nullable();
        $table->string('mswd_verification_fingerprint', 64)->nullable();
        $table->timestamp('document_requirements_captured_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id')->unique();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('barangay')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_assistance_request_document_checks', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id');
        $table->string('document_key');
        $table->string('label');
        $table->text('description')->nullable();
        $table->boolean('is_required')->default(true);
        $table->string('physical_copy_requirement')->default('unspecified');
        $table->unsignedInteger('sort_order')->default(0);
        $table->boolean('is_applicable')->default(true);
        $table->string('exemption_reason')->nullable();
        $table->string('verification_status')->default('pending');
        $table->unsignedBigInteger('inspected_media_id')->nullable();
        $table->string('inspected_media_version', 128)->nullable();
        $table->string('presented_copy_type', 64)->nullable();
        $table->text('remarks')->nullable();
        $table->ulid('checked_by_user_id')->nullable();
        $table->timestamp('checked_at')->nullable();
        $table->timestamps();
        $table->unique(['assistance_request_id', 'document_key']);
    });

    Schema::create('media', function (Blueprint $table): void {
        $table->id();
        $table->ulidMorphs('model');
        $table->uuid()->nullable()->unique();
        $table->string('collection_name');
        $table->string('name');
        $table->string('file_name');
        $table->string('mime_type')->nullable();
        $table->string('disk');
        $table->string('conversions_disk')->nullable();
        $table->unsignedBigInteger('size');
        $table->json('manipulations');
        $table->json('custom_properties');
        $table->json('generated_conversions');
        $table->json('responsive_images');
        $table->unsignedInteger('order_column')->nullable();
        $table->nullableTimestamps();
    });

    Schema::create('activity_log', function (Blueprint $table): void {
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
    activity()->enableLogging();

    foreach ([
        'activity_log',
        'media',
        'ac_assistance_request_document_checks',
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_beneficiaries',
        'ac_assistance_type_documents',
        'ac_document_types',
        'ac_assistance_types',
        'role_has_permissions',
        'model_has_roles',
        'model_has_permissions',
        'roles',
        'permissions',
        'users',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('requires a current scan and physical inspection before MSWD verification can be completed', function () {
    $context = mswdVerificationContext();

    $service = app(AssistanceMswdVerificationService::class);
    $started = $service->start(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
    );
    $beforeCheck = $service->payload($started);

    expect($started->mswd_verification_status)->toBe(MswdVerificationStatus::UnderReview)
        ->and($beforeCheck['blockers'])->toContain('MSWD must accept the current Medical Certificate scan and physical copy.');

    expect(fn () => $service->complete(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
        $beforeCheck['fingerprint'],
    ))->toThrow(DomainException::class, 'MSWD must accept the current Medical Certificate scan and physical copy.');

    $check = $service->documentChecksPayload($started)[0];
    $checked = $service->updateDocumentCheck(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
        'medical_certificate',
        [
            'status' => AssistanceRequestDocumentCheckStatus::Verified->value,
            'media_id' => $check['media_id'],
            'media_version' => $check['media_version'],
            'presented_copy_type' => 'original',
            'physical_inspected' => true,
            'remarks' => null,
        ],
    );
    $ready = $service->payload($checked);

    expect($ready['blockers'])->toBe([]);

    $completed = $service->complete(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
        $ready['fingerprint'],
    );

    expect($completed->mswd_verification_status)->toBe(MswdVerificationStatus::Verified)
        ->and($completed->mswd_verified_by_user_id)->toBe($context['reviewer_id']);

    $service->assertCurrent($completed);

    $scan = Media::query()->where('model_type', 'assistance_request')->firstOrFail();
    $scan->updated_at = now()->addMinute();
    $scan->save();

    expect(fn () => $service->assertCurrent($completed->fresh()))
        ->toThrow(DomainException::class, 'MSWD verification is no longer current');
});

it('does not start an MSWD review again when it is already active', function () {
    $context = mswdVerificationContext();
    $service = app(AssistanceMswdVerificationService::class);

    $started = $service->start(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
    );

    expect($started->mswd_verification_status)->toBe(MswdVerificationStatus::UnderReview);

    expect(fn () => $service->start(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
    ))->toThrow(DomainException::class, 'MSWD review is already active for the assigned reviewer.');
});

it('resumes an MSWD review after it was returned for correction', function () {
    $context = mswdVerificationContext();
    $service = app(AssistanceMswdVerificationService::class);

    $service->start(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
    );
    $returned = $service->returnForCorrection(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
        'Please replace the unreadable supporting document.',
    );

    expect($returned->mswd_verification_status)->toBe(MswdVerificationStatus::NeedsCorrection);

    $resumed = $service->start(
        $context['request_id'],
        $context['municipal_id'],
        $context['reviewer_id'],
    );

    expect($resumed->mswd_verification_status)->toBe(MswdVerificationStatus::UnderReview)
        ->and($resumed->mswd_verification_notes)->toBeNull();
});

it('replaces an additional supporting document while verification is unfinished and audits both media versions', function () {
    $context = mswdVerificationContext();
    grantMswdVerificationPermission($context['reviewer_id'], EnumPermissions::ACTION_CENTER_REQUESTS_PROCESS);
    DB::table('ac_assistance_requests')->where('id', $context['request_id'])->update([
        'status' => AssistanceStatus::Approved->value,
        'amount_approved' => 2500,
    ]);
    mswdVerificationMedia(
        $context['request_id'],
        'assistance_request',
        'documents',
        ['document_key' => 'hospital_bill'],
        now(),
    );

    $oldMedia = Media::query()
        ->where('model_type', 'assistance_request')
        ->where('model_id', $context['request_id'])
        ->get()
        ->first(fn (Media $media): bool => $media->getCustomProperty('document_key') === 'hospital_bill');

    activity()->enableLogging();

    $updated = app(ReplaceAssistanceAdditionalDocumentAction::class)->execute(
        new ReplaceAssistanceAdditionalDocumentDto(
            assistanceRequestId: $context['request_id'],
            mediaId: $oldMedia->id,
            municipalId: $context['municipal_id'],
            actorId: $context['reviewer_id'],
            document: UploadedFile::fake()->image('replacement-hospital-bill.jpg'),
        ),
    );

    $replacement = $updated->getMedia('documents')
        ->first(fn (Media $media): bool => $media->getCustomProperty('document_key') === 'hospital_bill');

    expect($replacement)->not->toBeNull()
        ->and($replacement->id)->not->toBe($oldMedia->id)
        ->and($replacement->file_name)->toBe('replacement-hospital-bill.jpg')
        ->and(Media::query()->find($oldMedia->id))->toBeNull();

    $activity = DB::table('activity_log')->where('subject_id', $context['request_id'])->latest('id')->first();
    $properties = json_decode($activity->properties, true, flags: JSON_THROW_ON_ERROR);

    expect($activity->description)->toBe('Replaced additional supporting document')
        ->and($properties['document_key'])->toBe('hospital_bill')
        ->and($properties['old_media']['id'])->toBe($oldMedia->id)
        ->and($properties['new_media']['id'])->toBe($replacement->id);
});

it('keeps checklist and identity evidence out of the additional-document replacement path', function (string $documentKey, string $message) {
    $context = mswdVerificationContext();
    grantMswdVerificationPermission($context['reviewer_id'], EnumPermissions::ACTION_CENTER_REQUESTS_PROCESS);

    if ($documentKey !== 'medical_certificate') {
        mswdVerificationMedia(
            $context['request_id'],
            'assistance_request',
            'documents',
            ['document_key' => $documentKey],
            now(),
        );
    }

    $media = Media::query()
        ->where('model_type', 'assistance_request')
        ->where('model_id', $context['request_id'])
        ->get()
        ->first(fn (Media $item): bool => $item->getCustomProperty('document_key') === $documentKey);

    expect(fn () => app(ReplaceAssistanceAdditionalDocumentAction::class)->execute(
        new ReplaceAssistanceAdditionalDocumentDto(
            assistanceRequestId: $context['request_id'],
            mediaId: $media->id,
            municipalId: $context['municipal_id'],
            actorId: $context['reviewer_id'],
            document: UploadedFile::fake()->image('replacement.jpg'),
        ),
    ))->toThrow(DomainException::class, $message);
})->with([
    'frozen checklist document' => ['medical_certificate', 'Use the MSWD document checklist uploader'],
    'filer identity document' => ['valid_id_front', 'Replace identity evidence through the beneficiary identity workflow'],
    'assisted-person identity document' => ['recipient_valid_id_back', 'Replace identity evidence through the beneficiary identity workflow'],
]);

it('locks additional supporting documents after MSWD verification is complete', function () {
    $context = mswdVerificationContext();
    grantMswdVerificationPermission($context['reviewer_id'], EnumPermissions::ACTION_CENTER_REQUESTS_PROCESS);
    mswdVerificationMedia(
        $context['request_id'],
        'assistance_request',
        'documents',
        ['document_key' => 'hospital_bill'],
        now(),
    );
    DB::table('ac_assistance_requests')->where('id', $context['request_id'])->update([
        'mswd_verification_status' => MswdVerificationStatus::Verified->value,
        'mswd_verified_at' => now(),
        'mswd_verified_by_user_id' => $context['reviewer_id'],
    ]);
    $media = Media::query()
        ->where('model_type', 'assistance_request')
        ->where('model_id', $context['request_id'])
        ->get()
        ->first(fn (Media $item): bool => $item->getCustomProperty('document_key') === 'hospital_bill');

    expect(fn () => app(ReplaceAssistanceAdditionalDocumentAction::class)->execute(
        new ReplaceAssistanceAdditionalDocumentDto(
            assistanceRequestId: $context['request_id'],
            mediaId: $media->id,
            municipalId: $context['municipal_id'],
            actorId: $context['reviewer_id'],
            document: UploadedFile::fake()->image('replacement.jpg'),
        ),
    ))->toThrow(DomainException::class, 'before MSWD verification is completed and before release');
});

it('locks additional supporting documents when an approved request has release artifacts', function () {
    $context = mswdVerificationContext();
    grantMswdVerificationPermission($context['reviewer_id'], EnumPermissions::ACTION_CENTER_REQUESTS_PROCESS);
    mswdVerificationMedia(
        $context['request_id'],
        'assistance_request',
        'documents',
        ['document_key' => 'hospital_bill'],
        now(),
    );
    DB::table('ac_assistance_requests')->where('id', $context['request_id'])->update([
        'status' => AssistanceStatus::Approved->value,
        'release_reference_number' => 'DV-2026-001',
    ]);
    $media = Media::query()
        ->where('model_type', 'assistance_request')
        ->where('model_id', $context['request_id'])
        ->get()
        ->first(fn (Media $item): bool => $item->getCustomProperty('document_key') === 'hospital_bill');

    expect(fn () => app(ReplaceAssistanceAdditionalDocumentAction::class)->execute(
        new ReplaceAssistanceAdditionalDocumentDto(
            assistanceRequestId: $context['request_id'],
            mediaId: $media->id,
            municipalId: $context['municipal_id'],
            actorId: $context['reviewer_id'],
            document: UploadedFile::fake()->image('replacement.jpg'),
        ),
    ))->toThrow(DomainException::class, 'before MSWD verification is completed and before release');
});

/** @return array{municipal_id:string,reviewer_id:string,request_id:string} */
function mswdVerificationContext(): array
{
    $municipalId = (string) Str::ulid();
    $reviewerId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    $householdId = (string) Str::ulid();
    $typeId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $documentTypeId = (string) Str::ulid();
    $now = now();

    DB::table('municipalities')->insert([
        'id' => $municipalId,
        'municipal_code' => '174003000',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('users')->insert([
        'id' => $reviewerId,
        'municipal_id' => $municipalId,
        'first_name' => 'MSWD',
        'last_name' => 'Reviewer',
        'user_name' => 'mswd-reviewer',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    $permissionId = (string) Str::ulid();
    DB::table('permissions')->insert([
        'id' => $permissionId,
        'name' => EnumPermissions::ACTION_CENTER_REQUESTS_VERIFY->value,
        'guard_name' => 'web',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('model_has_permissions')->insert([
        'permission_id' => $permissionId,
        'model_type' => 'user',
        'model_id' => $reviewerId,
    ]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    DB::table('ac_assistance_types')->insert([
        'id' => $typeId,
        'municipal_id' => $municipalId,
        'name' => 'Medical Assistance',
        'slug' => 'medical',
        'is_active' => true,
        'cooldown_months' => 0,
        'cooldown_type' => 'per_request',
        'cooldown_scope' => 'per_beneficiary',
        'is_independent' => false,
        'sort_order' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_document_types')->insert([
        'id' => $documentTypeId,
        'key' => 'medical_certificate',
        'label' => 'Medical Certificate',
        'description' => 'Current medical certificate.',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_type_documents')->insert([
        'id' => (string) Str::ulid(),
        'assistance_type_id' => $typeId,
        'document_type_id' => $documentTypeId,
        'is_required' => true,
        'physical_copy_requirement' => 'original',
        'sort_order' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'household_id' => $householdId,
        'municipal_id' => $municipalId,
        'is_active' => true,
        'first_name' => 'MARIA',
        'last_name' => 'SANTOS',
        'sex' => 'female',
        'birth_date' => '1985-05-10',
        'identity_verified_at' => $now,
        'identity_verified_by_user_id' => $reviewerId,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'beneficiary_id' => $beneficiaryId,
        'household_id' => $householdId,
        'assistance_type_id' => $typeId,
        'transaction_number' => 'REQ-2026-VERIFY-01',
        'status' => AssistanceStatus::UnderReview->value,
        'mswd_verification_status' => MswdVerificationStatus::Pending->value,
        'metadata' => json_encode([
            'household_assessment_snapshot' => [
                'source' => 'mswd_interview',
                'members' => [[
                    'household_member_id' => (string) Str::ulid(),
                    'full_name' => 'MARIA SANTOS',
                    'relationship' => 'head',
                ]],
            ],
        ], JSON_THROW_ON_ERROR),
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => 'MARIA',
        'last_name' => 'SANTOS',
        'barangay' => 'BAHI',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    mswdVerificationMedia($beneficiaryId, 'beneficiary', 'identity_id_front', [], $now);
    mswdVerificationMedia($requestId, 'assistance_request', 'documents', ['document_key' => 'medical_certificate'], $now);

    return [
        'municipal_id' => $municipalId,
        'reviewer_id' => $reviewerId,
        'request_id' => $requestId,
    ];
}

function grantMswdVerificationPermission(string $userId, EnumPermissions $permission): void
{
    $permissionId = (string) Str::ulid();
    DB::table('permissions')->insert([
        'id' => $permissionId,
        'name' => $permission->value,
        'guard_name' => 'web',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('model_has_permissions')->insert([
        'permission_id' => $permissionId,
        'model_type' => 'user',
        'model_id' => $userId,
    ]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
}

/** @param array<string, mixed> $properties */
function mswdVerificationMedia(string $modelId, string $modelType, string $collection, array $properties, $now): void
{
    DB::table('media')->insert([
        'model_type' => $modelType,
        'model_id' => $modelId,
        'uuid' => (string) Str::uuid(),
        'collection_name' => $collection,
        'name' => 'evidence',
        'file_name' => 'evidence.pdf',
        'mime_type' => 'application/pdf',
        'disk' => 'public',
        'size' => 100,
        'manipulations' => json_encode([], JSON_THROW_ON_ERROR),
        'custom_properties' => json_encode($properties, JSON_THROW_ON_ERROR),
        'generated_conversions' => json_encode([], JSON_THROW_ON_ERROR),
        'responsive_images' => json_encode([], JSON_THROW_ON_ERROR),
        'order_column' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
}
