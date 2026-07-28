<?php

use App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\ReleaseAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Exceptions\AssistanceApprovalException;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Assistance\ApproveAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\ReleaseAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\UpdateAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');

    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('cooldown_months')->default(0);
        $table->string('cooldown_type')->default('per_request');
        $table->string('cooldown_scope')->default('per_beneficiary');
        $table->boolean('is_independent')->default(false);
        $table->decimal('min_amount', 10, 2)->default(0);
        $table->decimal('max_amount', 10, 2)->nullable();
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->string('relationship')->nullable();
        $table->boolean('is_verified_dependent')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_document_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('key')->unique();
        $table->string('label');
        $table->timestamps();
    });

    Schema::create('ac_assistance_type_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_type_id');
        $table->ulid('document_type_id');
        $table->boolean('is_required')->default(true);
        $table->string('physical_copy_requirement')->default('unspecified');
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('encoded_by_user_id')->nullable();
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->ulid('approved_by_user_id')->nullable();
        $table->ulid('rejected_by_user_id')->nullable();
        $table->ulid('cancelled_by_user_id')->nullable();
        $table->ulid('released_by_user_id')->nullable();
        $table->string('release_reference_number', 60)->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->text('description')->nullable();
        $table->text('remarks')->nullable();
        $table->json('metadata')->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamp('rejected_at')->nullable();
        $table->timestamp('cancelled_at')->nullable();
        $table->timestamp('privacy_consented_at');
        $table->string('privacy_notice_version');
        $table->timestamps();
        $table->softDeletes();
        $table->unique(['municipal_id', 'release_reference_number']);
    });

    Schema::create('ac_beneficiary_cooldowns', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('beneficiary_id');
        $table->ulid('assistance_type_id');
        $table->ulid('assistance_request_id');
        $table->ulid('household_member_id')->nullable();
        $table->ulid('household_id')->nullable();
        $table->timestamp('cooldown_starts_at');
        $table->timestamp('cooldown_expires_at')->nullable();
        $table->timestamps();
    });

    Schema::create('media', function (Blueprint $table) {
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
        $table->unsignedInteger('order_column')->nullable()->index();
        $table->nullableTimestamps();
    });
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'media',
        'ac_beneficiary_cooldowns',
        'ac_assistance_requests',
        'ac_assistance_type_documents',
        'ac_document_types',
        'ac_household_members',
        'ac_assistance_types',
        'users',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('serializes edits with approval and rejects an edit that acquires the lock later', function () {
    $context = mutationLockContext();
    $request = mutationLockRequest($context);
    $updateAction = new UpdateAssistanceRequestAction(new LockAssistanceRequestAction);

    $edited = $updateAction->execute(mutationUpdateDto(
        context: $context,
        request: $request,
        description: 'Corrected before the reviewer approved the request.',
        fileName: 'medical-certificate-v1.png',
    ));

    expect($edited->description)->toBe('Corrected before the reviewer approved the request.')
        ->and($edited->getMedia('documents'))->toHaveCount(1)
        ->and($edited->getFirstMedia('documents')?->getCustomProperty('document_key'))
        ->toBe('medical_certificate');

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldReceive('requestApproved')->once();

    $approved = (new ApproveAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
    ))->execute(new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        approverId: $context['admin_id'],
        amountApproved: 2000,
        approvalNotes: 'Approved after document review.',
    ));

    expect($approved->status)->toBe(AssistanceStatus::Approved);

    expect(fn () => $updateAction->execute(mutationUpdateDto(
        context: $context,
        request: $request,
        description: 'A stale edit that must not be committed.',
        fileName: 'medical-certificate-v2.png',
    )))->toThrow(DomainException::class, 'already been Approved');

    $fresh = $request->fresh(['media']);

    expect($fresh->description)->toBe('Corrected before the reviewer approved the request.')
        ->and($fresh->getMedia('documents'))->toHaveCount(1)
        ->and($fresh->getFirstMedia('documents')?->file_name)->toBe('medical-certificate-v1.png')
        ->and(Storage::disk('public')->allFiles())->toHaveCount(1);

    expect(fn () => $fresh->update(['description' => 'Direct content mutation']))
        ->toThrow(DomainException::class, 'content-locked');
});

it('allows the dedicated release transition and rejects every later content edit', function () {
    $context = mutationLockContext();
    $request = mutationLockRequest($context);
    $request->update([
        'status' => AssistanceStatus::Approved,
        'amount_approved' => 1500,
        'approved_by_user_id' => $context['admin_id'],
        'approved_at' => now(),
    ]);

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldReceive('requestReleased')->once();

    $released = (new ReleaseAssistanceRequestAction($smsNotifier))->execute(
        new ReleaseAssistanceRequestDto(
            assistanceRequestId: $request->id,
            municipalId: $context['municipal_id'],
            cashierId: $context['admin_id'],
            cashierName: 'MSWD Cashier',
            releaseReferenceNumber: 'REL-2026-0001',
            releasedAt: CarbonImmutable::parse('2026-07-17'),
            releaseNotes: 'Released over the counter.',
        ),
    );

    expect($released->status)->toBe(AssistanceStatus::Released)
        ->and($released->release_reference_number)->toBe('REL-2026-0001');

    $updateAction = new UpdateAssistanceRequestAction(new LockAssistanceRequestAction);

    expect(fn () => $updateAction->execute(mutationUpdateDto(
        context: $context,
        request: $request,
        description: 'A stale edit after release.',
        fileName: 'late-document.png',
    )))->toThrow(DomainException::class, 'already been Released');

    expect(fn () => $released->update(['remarks' => 'Direct mutation after release']))
        ->toThrow(DomainException::class, 'immutable');

    expect($request->fresh()->description)->toBe('Original assistance request description.')
        ->and($request->fresh()->getMedia('documents'))->toHaveCount(0);
});

it('blocks approval until required documents are uploaded and ignores optional omissions', function () {
    $context = mutationLockContext();
    $request = mutationLockRequest($context);
    mutationDocumentRequirement($context, 'medical_certificate', 'Medical Certificate', true, 10);
    mutationDocumentRequirement($context, 'barangay_clearance', 'Barangay Clearance', false, 20);

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldReceive('requestApproved')->once();
    $action = new ApproveAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
    );
    $dto = new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        approverId: $context['admin_id'],
        amountApproved: 2000,
        approvalNotes: 'Approved after MSWD inspected the required document.',
    );

    expect(fn () => $action->execute($dto))
        ->toThrow(AssistanceApprovalException::class, 'Medical Certificate');

    $request
        ->addMedia(UploadedFile::fake()->image('medical-certificate.jpg'))
        ->withCustomProperties(['document_key' => 'medical_certificate'])
        ->toMediaCollection('documents');

    $approved = $action->execute($dto);

    expect($approved->status)->toBe(AssistanceStatus::Approved)
        ->and($approved->getMedia('documents'))->toHaveCount(1);
});

it('does not require assisted-person id uploads when a recorded exception applies', function () {
    $context = mutationLockContext();
    mutationDocumentRequirement($context, 'valid_id_front', 'Filer Valid Government ID - Front', true, 10);
    mutationDocumentRequirement($context, 'valid_id_back', 'Filer Valid Government ID - Back', true, 11);
    $request = mutationLockRequest($context);
    $memberId = (string) Str::ulid();
    DB::table('ac_household_members')->insert([
        'id' => $memberId,
        'household_id' => $context['household_id'],
        'relationship' => 'child',
        'is_verified_dependent' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $request->update([
        'on_behalf_household_member_id' => $memberId,
        'metadata' => [
            'recipient_id_exception' => 'minor',
            'relationship_to_beneficiary' => 'child',
        ],
    ]);

    foreach (['valid_id_front', 'valid_id_back'] as $key) {
        $request
            ->addMedia(UploadedFile::fake()->image("{$key}.jpg"))
            ->withCustomProperties(['document_key' => $key])
            ->toMediaCollection('documents');
    }

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldReceive('requestApproved')->once();

    $approved = (new ApproveAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
    ))->execute(new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        approverId: $context['admin_id'],
        amountApproved: 2000,
        approvalNotes: 'Approved after reviewing the minor recipient exception.',
    ));

    expect($approved->status)->toBe(AssistanceStatus::Approved);
});

function mutationLockContext(): array
{
    $context = [
        'municipal_id' => (string) Str::ulid(),
        'beneficiary_id' => (string) Str::ulid(),
        'household_id' => (string) Str::ulid(),
        'assistance_type_id' => (string) Str::ulid(),
        'admin_id' => (string) Str::ulid(),
    ];
    $now = now();

    DB::table('users')->insert([
        'id' => $context['admin_id'],
        'first_name' => 'Action Center',
        'last_name' => 'Admin',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_types')->insert([
        'id' => $context['assistance_type_id'],
        'municipal_id' => $context['municipal_id'],
        'name' => 'Medical Assistance',
        'slug' => 'medical',
        'is_active' => true,
        'cooldown_months' => 3,
        'cooldown_type' => 'per_request',
        'cooldown_scope' => 'per_beneficiary',
        'is_independent' => false,
        'min_amount' => 0,
        'max_amount' => 5000,
        'sort_order' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return $context;
}

function mutationLockRequest(array $context): AssistanceRequest
{
    return AssistanceRequest::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $context['municipal_id'],
        'beneficiary_id' => $context['beneficiary_id'],
        'household_id' => $context['household_id'],
        'assistance_type_id' => $context['assistance_type_id'],
        'reviewed_by_user_id' => $context['admin_id'],
        'transaction_number' => 'AC-2026-'.Str::upper(Str::random(8)),
        'status' => AssistanceStatus::UnderReview,
        'description' => 'Original assistance request description.',
        'reviewed_at' => now(),
        'privacy_consented_at' => now(),
        'privacy_notice_version' => 'v1.0',
    ]);
}

function mutationDocumentRequirement(
    array $context,
    string $key,
    string $label,
    bool $isRequired,
    int $sortOrder,
): void {
    $documentTypeId = (string) Str::ulid();
    $now = now();

    DB::table('ac_document_types')->insert([
        'id' => $documentTypeId,
        'key' => $key,
        'label' => $label,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_type_documents')->insert([
        'id' => (string) Str::ulid(),
        'assistance_type_id' => $context['assistance_type_id'],
        'document_type_id' => $documentTypeId,
        'is_required' => $isRequired,
        'sort_order' => $sortOrder,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
}

function mutationUpdateDto(
    array $context,
    AssistanceRequest $request,
    string $description,
    string $fileName,
): UpdateAssistanceRequestDto {
    return new UpdateAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        actingAdminId: $context['admin_id'],
        description: $description,
        documents: [
            'medical_certificate' => UploadedFile::fake()->image($fileName, 100, 100),
        ],
    );
}
