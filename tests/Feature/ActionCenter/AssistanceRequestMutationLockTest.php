<?php

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\CancelApprovedAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\CorrectMissingBurialDateOfDeathDto;
use App\Core\ActionCenter\Dto\Assistance\ReleaseAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Exceptions\AssistanceApprovalException;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Assistance\ApproveAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\CancelApprovedAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\CorrectMissingBurialDateOfDeathAction;
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
    activity()->enableLogging();

    foreach ([
        'activity_log',
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
    $updateAction = new UpdateAssistanceRequestAction(
        new LockAssistanceRequestAction,
        app(AssistanceRequestFormDefinitionProvider::class),
    );

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
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
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

    $updateAction = new UpdateAssistanceRequestAction(
        new LockAssistanceRequestAction,
        app(AssistanceRequestFormDefinitionProvider::class),
    );

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

it('cancels an approved unreleased request and expires its approval cooldowns', function () {
    $context = mutationLockContext();
    $request = mutationLockRequest($context);
    $approvedAt = now()->subDay();
    $request->update([
        'status' => AssistanceStatus::Approved,
        'amount_approved' => 2500,
        'approved_by_user_id' => $context['admin_id'],
        'approved_at' => $approvedAt,
        'remarks' => '[APPROVED] Original approval retained for audit.',
    ]);

    $cooldown = BeneficiaryCooldown::query()->create([
        'beneficiary_id' => $context['beneficiary_id'],
        'assistance_type_id' => $context['assistance_type_id'],
        'assistance_request_id' => $request->id,
        'household_id' => $context['household_id'],
        'cooldown_starts_at' => $approvedAt,
        'cooldown_expires_at' => null,
    ]);

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldReceive('approvedRequestCancelled')->once();

    $cancelled = (new CancelApprovedAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
    ))->execute(new CancelApprovedAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        cancelledByUserId: $context['admin_id'],
        cancelledByUserName: 'Action Center Admin',
        reason: 'Incorrectly encoded as filed for self instead of for the deceased household member.',
    ));

    expect($cancelled->status)->toBe(AssistanceStatus::Cancelled)
        ->and($cancelled->amount_approved)->toBe('2500.00')
        ->and($cancelled->approved_by_user_id)->toBe($context['admin_id'])
        ->and($cancelled->approved_at?->toDateTimeString())->toBe($approvedAt->toDateTimeString())
        ->and($cancelled->cancelled_by_user_id)->toBe($context['admin_id'])
        ->and($cancelled->cancelled_at)->not->toBeNull()
        ->and($cancelled->remarks)->toContain('APPROVED REQUEST CANCELLED')
        ->and($cancelled->remarks)->toContain('Incorrectly encoded as filed for self');

    $expiredCooldown = $cooldown->fresh();
    expect($expiredCooldown->cooldown_expires_at)->not->toBeNull()
        ->and($expiredCooldown->cooldown_expires_at->isFuture())->toBeFalse();

    expect(fn () => $cancelled->update(['description' => 'Direct mutation after cancellation']))
        ->toThrow(DomainException::class, 'Finalized assistance requests are immutable');
});

it('does not cancel released or non-approved assistance through the approved correction action', function () {
    $context = mutationLockContext();
    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldNotReceive('approvedRequestCancelled');
    $action = new CancelApprovedAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
    );

    $pending = mutationLockRequest($context);
    $pending->update(['status' => AssistanceStatus::Pending]);

    expect(fn () => $action->execute(new CancelApprovedAssistanceRequestDto(
        assistanceRequestId: $pending->id,
        municipalId: $context['municipal_id'],
        cancelledByUserId: $context['admin_id'],
        cancelledByUserName: 'Action Center Admin',
        reason: 'This is not an approved request and must use another workflow.',
    )))->toThrow(DomainException::class, 'Only an approved request');

    $released = mutationLockRequest($context);
    $released->update([
        'status' => AssistanceStatus::Approved,
        'amount_approved' => 1500,
        'approved_by_user_id' => $context['admin_id'],
        'approved_at' => now(),
    ]);
    $released->update([
        'status' => AssistanceStatus::Released,
        'released_by_user_id' => $context['admin_id'],
        'released_at' => now(),
        'release_reference_number' => 'REL-CANNOT-CANCEL',
        'remarks' => 'Released in test.',
    ]);

    expect(fn () => $action->execute(new CancelApprovedAssistanceRequestDto(
        assistanceRequestId: $released->id,
        municipalId: $context['municipal_id'],
        cancelledByUserId: $context['admin_id'],
        cancelledByUserName: 'Action Center Admin',
        reason: 'Attempted cancellation after physical release must be blocked.',
    )))->toThrow(DomainException::class, 'Released assistance is immutable');
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
        app(AssistanceRequestFormDefinitionProvider::class),
    );
    $dto = new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
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
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        approverId: $context['admin_id'],
        amountApproved: 2000,
        approvalNotes: 'Approved after reviewing the minor recipient exception.',
    ));

    expect($approved->status)->toBe(AssistanceStatus::Approved);
});

it('blocks approval of an open configured burial request until date of death is recorded', function () {
    $context = mutationLockContext();
    DB::table('ac_assistance_types')
        ->where('id', $context['assistance_type_id'])
        ->update([
            'name' => 'Burial Assistance for Senior Citizen',
            'slug' => 'burial-assisstance-senior-citizen',
        ]);
    $request = mutationLockRequest($context);

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldNotReceive('requestApproved');

    $action = new ApproveAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
        app(AssistanceRequestFormDefinitionProvider::class),
    );

    expect(fn () => $action->execute(new ApproveAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        approverId: $context['admin_id'],
        amountApproved: 2000,
        approvalNotes: 'Should remain blocked until the burial data is complete.',
    )))->toThrow(AssistanceApprovalException::class, 'date of death is missing');

    expect($request->fresh()->status)->toBe(AssistanceStatus::UnderReview);
});

it('adds a missing date of death once for an approved burial request and records the correction', function (string $slug) {
    $context = mutationLockContext();
    DB::table('ac_assistance_types')
        ->where('id', $context['assistance_type_id'])
        ->update([
            'name' => 'Burial Assistance',
            'slug' => $slug,
        ]);

    $request = mutationLockRequest($context);
    $request->created_at = now()->subDay();
    $request->save();

    $originalMetadata = [
        'relationship_to_beneficiary' => 'child',
        'on_behalf_first_name' => 'DECEASED',
        'on_behalf_last_name' => 'PERSON',
        'on_behalf_birth_date' => '1950-01-01',
        'existing_key' => 'preserve-me',
    ];
    $request->update([
        'status' => AssistanceStatus::Approved,
        'amount_approved' => 2500,
        'approved_by_user_id' => $context['admin_id'],
        'approved_at' => now(),
        'description' => 'Keep this description unchanged.',
        'remarks' => 'Keep these remarks unchanged.',
        'metadata' => $originalMetadata,
        'on_behalf_household_member_id' => (string) Str::ulid(),
    ]);

    activity()->enableLogging();

    $corrected = (new CorrectMissingBurialDateOfDeathAction(
        new LockAssistanceRequestAction,
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(new CorrectMissingBurialDateOfDeathDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        correctedByUserId: $context['admin_id'],
        dateOfDeath: '2026-08-20',
        reason: 'Legacy approved burial request was missing the recorded date of death.',
    ));

    expect($corrected->status)->toBe(AssistanceStatus::Approved)
        ->and($corrected->amount_approved)->toBe('2500.00')
        ->and($corrected->description)->toBe('Keep this description unchanged.')
        ->and($corrected->remarks)->toBe('Keep these remarks unchanged.')
        ->and($corrected->metadata)->toMatchArray([
            ...$originalMetadata,
            'on_behalf_date_of_death' => '2026-08-20',
        ]);

    $log = DB::table('activity_log')
        ->where('subject_id', $request->id)
        ->latest('id')
        ->first();
    expect($log)->not->toBeNull();

    $properties = json_decode($log->properties, true, flags: JSON_THROW_ON_ERROR);

    expect($log->description)->toBe('Added missing burial Date of Death')
        ->and($log->causer_id)->toBe($context['admin_id'])
        ->and($properties['old']['on_behalf_date_of_death'])->toBeNull()
        ->and($properties['attributes']['on_behalf_date_of_death'])->toBe('2026-08-20')
        ->and($properties['corrected_by_user_id'])->toBe($context['admin_id'])
        ->and($properties['correction_reason'])
        ->toBe('Legacy approved burial request was missing the recorded date of death.')
        ->and($properties['corrected_at'])->toBeString();

    expect(fn () => (new CorrectMissingBurialDateOfDeathAction(
        new LockAssistanceRequestAction,
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(new CorrectMissingBurialDateOfDeathDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        correctedByUserId: $context['admin_id'],
        dateOfDeath: '2026-08-20',
        reason: 'A second correction attempt must be rejected.',
    )))->toThrow(DomainException::class, 'already has a Date of Death');
})->with([
    'regular burial' => 'burial',
    'senior burial' => 'burial-assisstance-senior-citizen',
]);

it('rejects the approved burial correction for invalid filing, dates, and release artifacts', function () {
    $context = mutationLockContext();
    DB::table('ac_assistance_types')
        ->where('id', $context['assistance_type_id'])
        ->update([
            'name' => 'Burial Assistance',
            'slug' => 'burial',
        ]);

    $selfRequest = mutationLockRequest($context);
    $selfRequest->created_at = now()->subDay();
    $selfRequest->save();
    $selfRequest->update([
        'status' => AssistanceStatus::Approved,
        'amount_approved' => 2500,
        'approved_by_user_id' => $context['admin_id'],
        'approved_at' => now(),
    ]);

    $action = new CorrectMissingBurialDateOfDeathAction(
        new LockAssistanceRequestAction,
        app(AssistanceRequestFormDefinitionProvider::class),
    );
    $dto = fn (string $date, AssistanceRequest $request): CorrectMissingBurialDateOfDeathDto => new CorrectMissingBurialDateOfDeathDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        correctedByUserId: $context['admin_id'],
        dateOfDeath: $date,
        reason: 'A valid administrative correction reason.',
    );

    expect(fn () => $action->execute($dto('2026-08-20', $selfRequest)))
        ->toThrow(DomainException::class, 'not recorded as filed on behalf');

    $request = mutationLockRequest($context);
    $request->created_at = now()->subDay();
    $request->save();
    $request->update([
        'on_behalf_household_member_id' => (string) Str::ulid(),
        'metadata' => [
            'relationship_to_beneficiary' => 'child',
            'on_behalf_birth_date' => '1950-01-01',
        ],
    ]);
    $request->update([
        'status' => AssistanceStatus::Approved,
        'amount_approved' => 2500,
        'approved_by_user_id' => $context['admin_id'],
        'approved_at' => now(),
    ]);

    expect(fn () => $action->execute($dto('1949-12-31', $request)))
        ->toThrow(DomainException::class, 'earlier than the assisted person');

    expect(fn () => $action->execute($dto('2026-08-27', $request)))
        ->toThrow(DomainException::class, 'later than the assistance request submission');

    $request->update([
        'status' => AssistanceStatus::Released,
        'released_by_user_id' => $context['admin_id'],
        'released_at' => now(),
        'release_reference_number' => 'REL-CANNOT-CORRECT',
    ]);

    expect(fn () => $action->execute($dto('2026-08-20', $request)))
        ->toThrow(DomainException::class, 'Only an approved assistance request');
});

it('allows an admin to correct date of death on an editable configured burial request', function () {
    $context = mutationLockContext();
    DB::table('ac_assistance_types')
        ->where('id', $context['assistance_type_id'])
        ->update([
            'name' => 'Burial Assistance',
            'slug' => 'burial',
        ]);
    $request = mutationLockRequest($context);
    $action = new UpdateAssistanceRequestAction(
        new LockAssistanceRequestAction,
        app(AssistanceRequestFormDefinitionProvider::class),
    );

    $updated = $action->execute(mutationUpdateDto(
        context: $context,
        request: $request,
        description: 'Burial assistance request with corrected death information.',
        fileName: 'death-certificate.png',
        onBehalfDateOfDeath: '2026-08-20',
    ));

    expect($updated->metadata)->toMatchArray([
        'on_behalf_date_of_death' => '2026-08-20',
        'recipient_id_exception' => 'deceased',
    ]);
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
    ?string $onBehalfDateOfDeath = null,
): UpdateAssistanceRequestDto {
    return new UpdateAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        actingAdminId: $context['admin_id'],
        description: $description,
        onBehalfDateOfDeath: $onBehalfDateOfDeath,
        documents: [
            'medical_certificate' => UploadedFile::fake()->image($fileName, 100, 100),
        ],
    );
}
