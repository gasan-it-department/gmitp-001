<?php

use App\Core\ActionCenter\Dto\Assistance\ReleaseAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\SaveAssistanceDisbursementDto;
use App\Core\ActionCenter\Dto\Assistance\VoidAssistanceDisbursementDto;
use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use App\Core\ActionCenter\Services\AssistanceDisbursementService;
use App\Core\ActionCenter\Services\AssistanceDisbursementSmsNotifier;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Assistance\MarkAssistanceDisbursementReadyAction;
use App\Core\ActionCenter\UseCase\Assistance\RecordAssistanceDisbursementManualContactAction;
use App\Core\ActionCenter\UseCase\Assistance\ReleaseAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\SaveAssistanceDisbursementAction;
use App\Core\ActionCenter\UseCase\Assistance\SendAssistanceDisbursementNotificationAction;
use App\Core\ActionCenter\UseCase\Assistance\VoidAssistanceDisbursementAction;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();

    Schema::create('municipalities', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('slug');
        $table->string('municipal_code');
        $table->timestamps();
    });

    Schema::create('users', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_assistance_types', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->unsignedInteger('cooldown_months')->default(0);
        $table->string('cooldown_type')->default('per_request');
        $table->string('cooldown_scope')->default('per_beneficiary');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_household_members', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('household_id');
        $table->string('contact_phone')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->ulid('approved_by_user_id')->nullable();
        $table->ulid('released_by_user_id')->nullable();
        $table->string('release_reference_number', 60)->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->string('mswd_verification_status')->nullable();
        $table->string('mswd_verification_fingerprint')->nullable();
        $table->json('metadata')->nullable();
        $table->text('remarks')->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamp('mswd_verified_at')->nullable();
        $table->timestamp('privacy_consented_at')->nullable();
        $table->string('privacy_notice_version')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id')->unique();
        $table->string('first_name')->nullable();
        $table->string('middle_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('suffix')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_assistance_request_document_checks', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id');
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_assistance_disbursements', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('assistance_request_id');
        $table->unsignedSmallInteger('attempt_number');
        $table->string('method', 24);
        $table->string('status', 24);
        $table->decimal('amount', 10, 2);
        $table->string('payee_name');
        $table->string('instrument_reference_number', 100);
        $table->date('instrument_date');
        $table->string('claim_location_key', 80);
        $table->string('claim_location_label');
        $table->text('claim_instructions')->nullable();
        $table->string('source_fingerprint', 64);
        $table->text('preparation_notes')->nullable();
        $table->ulid('prepared_by_user_id')->nullable();
        $table->timestamp('prepared_at');
        $table->ulid('ready_by_user_id')->nullable();
        $table->timestamp('ready_at')->nullable();
        $table->string('notification_status', 24)->nullable();
        $table->string('notification_phone', 40)->nullable();
        $table->text('notification_message')->nullable();
        $table->unsignedSmallInteger('notification_attempts')->default(0);
        $table->timestamp('notification_attempted_at')->nullable();
        $table->timestamp('notification_sent_at')->nullable();
        $table->text('notification_failure')->nullable();
        $table->ulid('released_by_user_id')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->string('release_reference_number', 60)->nullable();
        $table->string('receiver_type', 24)->nullable();
        $table->string('receiver_name')->nullable();
        $table->string('receiver_relationship', 100)->nullable();
        $table->string('receiver_id_type', 100)->nullable();
        $table->string('receiver_id_last_four', 4)->nullable();
        $table->timestamp('identity_checked_at')->nullable();
        $table->timestamp('acknowledgement_signed_at')->nullable();
        $table->text('release_notes')->nullable();
        $table->ulid('voided_by_user_id')->nullable();
        $table->timestamp('voided_at')->nullable();
        $table->text('void_reason')->nullable();
        $table->json('metadata')->nullable();
        $table->timestamps();
        $table->unique(['assistance_request_id', 'attempt_number']);
    });
    DB::statement(
        "CREATE UNIQUE INDEX ac_disbursement_instrument_unique
         ON ac_assistance_disbursements (municipal_id, method, instrument_reference_number)
         WHERE status <> 'voided'",
    );

    $this->municipalId = (string) Str::ulid();
    $this->actorId = (string) Str::ulid();
    $this->requestId = (string) Str::ulid();
    $this->typeId = (string) Str::ulid();
    $this->beneficiaryId = (string) Str::ulid();
    $this->householdId = (string) Str::ulid();

    DB::table('users')->insert([
        'id' => $this->actorId,
        'first_name' => 'Finance',
        'last_name' => 'Officer',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('municipalities')->insert([
        'id' => $this->municipalId,
        'name' => 'Gasan',
        'slug' => 'gasan-4905',
        'municipal_code' => '174003000',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_assistance_types')->insert([
        'id' => $this->typeId,
        'municipal_id' => $this->municipalId,
        'name' => 'Medical Assistance',
        'slug' => 'medical-assistance',
        'cooldown_months' => 3,
        'cooldown_type' => 'per_request',
        'cooldown_scope' => 'per_beneficiary',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $this->beneficiaryId,
        'municipal_id' => $this->municipalId,
        'household_id' => $this->householdId,
        'contact_phone' => '09171234567',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_assistance_requests')->insert([
        'id' => $this->requestId,
        'municipal_id' => $this->municipalId,
        'beneficiary_id' => $this->beneficiaryId,
        'household_id' => $this->householdId,
        'assistance_type_id' => $this->typeId,
        'approved_by_user_id' => $this->actorId,
        'amount_approved' => 4000,
        'transaction_number' => 'REQ-2026-9001',
        'status' => AssistanceStatus::Approved->value,
        'mswd_verification_status' => 'verified',
        'mswd_verification_fingerprint' => hash('sha256', 'verified'),
        'approved_at' => now()->subDay(),
        'mswd_verified_at' => now()->subHour(),
        'privacy_consented_at' => now(),
        'privacy_notice_version' => 'v1',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $this->requestId,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'ac_assistance_disbursements',
        'ac_assistance_request_document_checks',
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_beneficiaries',
        'ac_household_members',
        'ac_assistance_types',
        'users',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('keeps the ready notice free of the amount and financial instrument reference', function () {
    $request = AssistanceRequest::query()->with('beneficiary')->findOrFail($this->requestId);
    $disbursement = AssistanceDisbursement::query()->create(disbursementAttributes($this));
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')
        ->once()
        ->withArgs(function (string $phone, string $message): bool {
            expect($phone)->toBe('09171234567')
                ->and($message)->toContain('REQ-2026-9001')
                ->and($message)->toContain('Municipal Treasurer\'s Office')
                ->and($message)->not->toContain('4000')
                ->and($message)->not->toContain('4,000')
                ->and($message)->not->toContain('CHK-READY-1');

            return true;
        })
        ->andReturn([['status' => 'Sent']]);

    $outcome = (new AssistanceDisbursementSmsNotifier($provider))->ready($request, $disbursement);

    expect($outcome['status'])->toBe('sent')
        ->and($outcome['phone'])->toBe('09171234567')
        ->and($outcome['provider_status'])->toBe('Sent');
});

it('maps Semaphore submission statuses without claiming queued messages were sent', function (array $response, string $expectedStatus) {
    $request = AssistanceRequest::query()->with('beneficiary')->findOrFail($this->requestId);
    $disbursement = AssistanceDisbursement::query()->create(disbursementAttributes($this));
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')->once()->andReturn($response);

    $outcome = (new AssistanceDisbursementSmsNotifier($provider))->ready($request, $disbursement);

    expect($outcome['status'])->toBe($expectedStatus)
        ->and($outcome['provider_message_id'])->toBe(isset($response[0]['message_id']) ? (string) $response[0]['message_id'] : null)
        ->and($outcome['provider_status'])->toBe($response[0]['status'] ?? null);
})->with([
    'queued' => [[['message_id' => 101, 'status' => 'Queued']], 'submitted'],
    'pending' => [[['message_id' => 102, 'status' => 'Pending']], 'submitted'],
    'sent' => [[['message_id' => 103, 'status' => 'Sent']], 'sent'],
    'failed' => [[['message_id' => 104, 'status' => 'Failed']], 'failed'],
    'refunded' => [[['message_id' => 105, 'status' => 'Refunded']], 'failed'],
    'malformed successful response' => [[], 'submitted'],
]);

it('marks missing phones unavailable without calling Semaphore', function () {
    DB::table('ac_beneficiaries')->where('id', $this->beneficiaryId)->update(['contact_phone' => null]);
    $request = AssistanceRequest::query()->with('beneficiary')->findOrFail($this->requestId);
    $disbursement = AssistanceDisbursement::query()->create(disbursementAttributes($this));
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldNotReceive('send');

    $outcome = (new AssistanceDisbursementSmsNotifier($provider))->ready($request, $disbursement);

    expect($outcome['status'])->toBe('unavailable')
        ->and($outcome['failure'])->toContain('no contact number');
});

it('records provider failures and timeouts as failed submissions', function (bool $throws) {
    $request = AssistanceRequest::query()->with('beneficiary')->findOrFail($this->requestId);
    $disbursement = AssistanceDisbursement::query()->create(disbursementAttributes($this));
    $provider = Mockery::mock(SmsProviderInterface::class);
    $expectation = $provider->shouldReceive('send')->once();
    $throws
        ? $expectation->andThrow(new RuntimeException('Semaphore timed out.'))
        : $expectation->andReturn(null);

    $outcome = (new AssistanceDisbursementSmsNotifier($provider))->ready($request, $disbursement);

    expect($outcome['status'])->toBe('failed')
        ->and($outcome['failure'])->not->toBeNull();
})->with([
    'HTTP failure' => [false],
    'timeout' => [true],
]);

it('stores the exact claim notice and Semaphore acceptance details', function () {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = 'pending';
    $ready = AssistanceDisbursement::query()->create($attributes);
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')->once()->andReturn([['message_id' => 501, 'status' => 'Queued']]);

    $result = (new SendAssistanceDisbursementNotificationAction(
        new LockActionCenterMunicipalityAction,
        new AssistanceDisbursementSmsNotifier($provider),
    ))->execute($this->requestId, $ready->id, $this->municipalId, $this->actorId);

    expect($result->notification_status)->toBe('submitted')
        ->and($result->notification_phone)->toBe('09171234567')
        ->and($result->notification_message)->toContain('REQ-2026-9001')
        ->and($result->notification_attempts)->toBe(1)
        ->and($result->notification_sent_at)->toBeNull()
        ->and(data_get($result->metadata, 'notifications.claim_ready.provider_message_id'))->toBe('501')
        ->and(data_get($result->metadata, 'notifications.claim_ready.provider_status'))->toBe('Queued');
});

it('allows retries only after failed or unavailable submissions', function (string $status, bool $allowed) {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = $status;
    $ready = AssistanceDisbursement::query()->create($attributes);
    $provider = Mockery::mock(SmsProviderInterface::class);

    if ($allowed) {
        $provider->shouldReceive('send')->once()->andReturn([['message_id' => 601, 'status' => 'Queued']]);
        $result = (new SendAssistanceDisbursementNotificationAction(
            new LockActionCenterMunicipalityAction,
            new AssistanceDisbursementSmsNotifier($provider),
        ))->execute($this->requestId, $ready->id, $this->municipalId, $this->actorId);

        expect($result->notification_status)->toBe('submitted');

        return;
    }

    $provider->shouldNotReceive('send');
    expect(fn () => (new SendAssistanceDisbursementNotificationAction(
        new LockActionCenterMunicipalityAction,
        new AssistanceDisbursementSmsNotifier($provider),
    ))->execute($this->requestId, $ready->id, $this->municipalId, $this->actorId))
        ->toThrow(DomainException::class);
})->with([
    'failed can retry' => ['failed', true],
    'unavailable can retry' => ['unavailable', true],
    'sending cannot retry' => ['sending', false],
    'submitted cannot retry' => ['submitted', false],
    'sent cannot retry' => ['sent', false],
]);

it('records manual contact only when SMS failed or was unavailable', function (string $status, bool $allowed) {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = $status;
    $ready = AssistanceDisbursement::query()->create($attributes);
    $action = new RecordAssistanceDisbursementManualContactAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
    );

    if ($allowed) {
        $result = $action->execute(
            $this->requestId,
            $ready->id,
            $this->municipalId,
            $this->actorId,
            'phone_call',
            'The claimant was advised where and when to claim the assistance.',
        );

        expect(data_get($result->metadata, 'manual_contacts.0.channel'))->toBe('phone_call');

        return;
    }

    expect(fn () => $action->execute(
        $this->requestId,
        $ready->id,
        $this->municipalId,
        $this->actorId,
        'phone_call',
        'The claimant was advised where and when to claim the assistance.',
    ))->toThrow(DomainException::class, 'only be recorded');
})->with([
    'failed' => ['failed', true],
    'unavailable' => ['unavailable', true],
    'submitted' => ['submitted', false],
    'sent' => ['sent', false],
]);

it('creates and updates one frozen disbursement draft without releasing the request', function () {
    $request = AssistanceRequest::query()->findOrFail($this->requestId);
    $service = Mockery::mock(AssistanceDisbursementService::class);
    $service->shouldReceive('assertRequestCanPrepare')->twice();
    $service->shouldReceive('resolveClaimLocation')->twice()->andReturn([
        'key' => 'treasury',
        'label' => 'Municipal Treasurer\'s Office',
        'instructions' => 'Bring a valid ID.',
        'office_hours' => 'Weekdays',
    ]);
    $service->shouldReceive('payeeName')->twice()->andReturn('Juan Dela Cruz');
    $service->shouldReceive('fingerprint')->twice()->andReturn(hash('sha256', 'source'));

    $action = new SaveAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $service,
    );
    $draft = $action->execute(disbursementDto($this, 'check', 'CHK-100'));
    $updated = $action->execute(disbursementDto($this, 'cash', 'CV-200'));

    expect($updated->id)->toBe($draft->id)
        ->and($updated->attempt_number)->toBe(1)
        ->and($updated->method->value)->toBe('cash')
        ->and((float) $updated->amount)->toBe(4000.0)
        ->and($updated->payee_name)->toBe('Juan Dela Cruz')
        ->and(AssistanceDisbursement::query()->count())->toBe(1)
        ->and($request->fresh()->status)->toBe(AssistanceStatus::Approved)
        ->and($request->fresh()->released_at)->toBeNull();
});

it('marks the instrument ready without releasing, then records physical handover atomically', function () {
    $request = AssistanceRequest::query()->findOrFail($this->requestId);
    $draft = AssistanceDisbursement::query()->create(disbursementAttributes($this));

    $service = Mockery::mock(AssistanceDisbursementService::class);
    $service->shouldReceive('assertCurrent')->twice();
    $service->shouldReceive('resolveClaimLocation')->once()->andReturn([
        'key' => 'treasury',
        'label' => 'Municipal Treasurer\'s Office',
        'instructions' => 'Bring a valid ID.',
        'office_hours' => 'Weekdays',
    ]);
    $notify = Mockery::mock(SendAssistanceDisbursementNotificationAction::class);
    $notify->shouldReceive('execute')->once()->andReturnUsing(
        fn () => $draft->fresh(),
    );

    $ready = (new MarkAssistanceDisbursementReadyAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $service,
        $notify,
    ))->execute($request->id, $draft->id, $this->municipalId, $this->actorId);

    expect($ready->status)->toBe(AssistanceDisbursementStatus::Ready)
        ->and($request->fresh()->status)->toBe(AssistanceStatus::Approved)
        ->and($request->fresh()->released_at)->toBeNull();

    $sms = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $sms->shouldReceive('requestReleased')->once();
    $verification = Mockery::mock(AssistanceMswdVerificationService::class);
    $verification->shouldReceive('assertCurrent')->once();
    $cooldowns = app(AssistanceCooldownService::class);

    $released = (new ReleaseAssistanceRequestAction(
        $sms,
        $verification,
        new LockActionCenterMunicipalityAction,
        $cooldowns,
        $service,
    ))->execute(new ReleaseAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $this->municipalId,
        cashierId: $this->actorId,
        cashierName: 'Treasury Officer',
        releaseReferenceNumber: 'ACK-2026-01',
        releasedAt: CarbonImmutable::parse('2026-09-18'),
        releaseNotes: 'Claimed at Treasury.',
        disbursementId: $draft->id,
        receiverType: 'claimant',
    ));

    $finalDisbursement = $draft->fresh();

    expect($released->status)->toBe(AssistanceStatus::Released)
        ->and($released->release_reference_number)->toBe('ACK-2026-01')
        ->and($finalDisbursement->status)->toBe(AssistanceDisbursementStatus::Released)
        ->and($finalDisbursement->receiver_type)->toBe('claimant')
        ->and($finalDisbursement->receiver_name)->toBe('Juan Dela Cruz')
        ->and($finalDisbursement->identity_checked_at)->not->toBeNull()
        ->and($finalDisbursement->acknowledgement_signed_at)->not->toBeNull();
});

it('requires a ready disbursement before physical release', function () {
    $request = AssistanceRequest::query()->findOrFail($this->requestId);
    $draft = AssistanceDisbursement::query()->create(disbursementAttributes($this));
    $sms = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $sms->shouldNotReceive('requestReleased');
    $verification = Mockery::mock(AssistanceMswdVerificationService::class);
    $verification->shouldReceive('assertCurrent')->once();
    $service = Mockery::mock(AssistanceDisbursementService::class);
    $service->shouldNotReceive('assertCurrent');

    expect(fn () => (new ReleaseAssistanceRequestAction(
        $sms,
        $verification,
        new LockActionCenterMunicipalityAction,
        app(AssistanceCooldownService::class),
        $service,
    ))->execute(new ReleaseAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $this->municipalId,
        cashierId: $this->actorId,
        cashierName: 'Treasury Officer',
        releaseReferenceNumber: 'ACK-2026-02',
        releasedAt: CarbonImmutable::parse('2026-09-18'),
        releaseNotes: null,
        disbursementId: $draft->id,
        receiverType: 'claimant',
    )))->toThrow(DomainException::class, 'Ready for Claim');

    expect($request->fresh()->status)->toBe(AssistanceStatus::Approved)
        ->and($draft->fresh()->status)->toBe(AssistanceDisbursementStatus::Preparing);
});

it('requires identity inspection and a signed acknowledgement at the Core boundary', function () {
    $request = AssistanceRequest::query()->findOrFail($this->requestId);
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $draft = AssistanceDisbursement::query()->create($attributes);
    $sms = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $sms->shouldNotReceive('requestReleased');
    $verification = Mockery::mock(AssistanceMswdVerificationService::class);
    $verification->shouldReceive('assertCurrent')->once();
    $service = Mockery::mock(AssistanceDisbursementService::class);
    $service->shouldNotReceive('assertCurrent');

    expect(fn () => (new ReleaseAssistanceRequestAction(
        $sms,
        $verification,
        new LockActionCenterMunicipalityAction,
        app(AssistanceCooldownService::class),
        $service,
    ))->execute(new ReleaseAssistanceRequestDto(
        assistanceRequestId: $request->id,
        municipalId: $this->municipalId,
        cashierId: $this->actorId,
        cashierName: 'Treasury Officer',
        releaseReferenceNumber: 'ACK-2026-03',
        releasedAt: CarbonImmutable::parse('2026-09-18'),
        releaseNotes: null,
        disbursementId: $draft->id,
        receiverType: 'claimant',
        identityConfirmed: false,
        acknowledgementSigned: true,
    )))->toThrow(DomainException::class, 'identity inspection');

    expect($request->fresh()->status)->toBe(AssistanceStatus::Approved)
        ->and($draft->fresh()->status)->toBe(AssistanceDisbursementStatus::Ready);
});

it('keeps a voided notified attempt in history and creates a replacement attempt', function () {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = 'sent';
    $ready = AssistanceDisbursement::query()->create($attributes);
    $notifier = Mockery::mock(AssistanceDisbursementSmsNotifier::class);
    $notifier->shouldReceive('voided')->once()->andReturn([
        'status' => 'sent',
        'phone' => '09171234567',
        'message' => 'Cancelled claim notice.',
        'failure' => null,
    ]);

    $voided = (new VoidAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $notifier,
    ))->execute(new VoidAssistanceDisbursementDto(
        assistanceRequestId: $this->requestId,
        disbursementId: $ready->id,
        municipalId: $this->municipalId,
        actorId: $this->actorId,
        reason: 'The claim location was incorrect, but the same physical check remains valid.',
    ));

    $service = Mockery::mock(AssistanceDisbursementService::class);
    $service->shouldReceive('assertRequestCanPrepare')->once();
    $service->shouldReceive('resolveClaimLocation')->once()->andReturn([
        'key' => 'treasury',
        'label' => 'Municipal Treasurer\'s Office',
        'instructions' => 'Bring a valid ID.',
        'office_hours' => 'Weekdays',
    ]);
    $service->shouldReceive('payeeName')->once()->andReturn('Juan Dela Cruz');
    $service->shouldReceive('fingerprint')->once()->andReturn(hash('sha256', 'replacement'));
    $replacement = (new SaveAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $service,
    ))->execute(disbursementDto($this, 'check', 'CHK-READY-1'));

    expect($voided->status)->toBe(AssistanceDisbursementStatus::Voided)
        ->and($voided->void_reason)->toContain('same physical check')
        ->and($replacement->attempt_number)->toBe(2)
        ->and($replacement->status)->toBe(AssistanceDisbursementStatus::Preparing)
        ->and(AssistanceDisbursement::query()->count())->toBe(2);
});

it('blocks voiding while a recent SMS submission is in progress', function () {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = 'sending';
    $attributes['notification_attempted_at'] = now();
    $ready = AssistanceDisbursement::query()->create($attributes);
    $notifier = Mockery::mock(AssistanceDisbursementSmsNotifier::class);
    $notifier->shouldNotReceive('voided');

    expect(fn () => (new VoidAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $notifier,
    ))->execute(new VoidAssistanceDisbursementDto(
        assistanceRequestId: $this->requestId,
        disbursementId: $ready->id,
        municipalId: $this->municipalId,
        actorId: $this->actorId,
        reason: 'The financial instrument details require a reviewed correction.',
    )))->toThrow(DomainException::class, 'currently being submitted');

    expect($ready->fresh()->status)->toBe(AssistanceDisbursementStatus::Ready);
});

it('sends a precautionary cancellation when a sending state is stale', function () {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = 'sending';
    $attributes['notification_attempted_at'] = now()->subMinutes(6);
    $ready = AssistanceDisbursement::query()->create($attributes);
    $notifier = Mockery::mock(AssistanceDisbursementSmsNotifier::class);
    $notifier->shouldReceive('voided')->once()->andReturn([
        'status' => 'submitted',
        'phone' => '09171234567',
        'message' => 'Cancelled claim notice.',
        'failure' => null,
        'provider_message_id' => '701',
        'provider_status' => 'Queued',
    ]);

    $voided = (new VoidAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $notifier,
    ))->execute(new VoidAssistanceDisbursementDto(
        assistanceRequestId: $this->requestId,
        disbursementId: $ready->id,
        municipalId: $this->municipalId,
        actorId: $this->actorId,
        reason: 'The SMS submission became stale while the financial record required correction.',
    ));

    expect($voided->status)->toBe(AssistanceDisbursementStatus::Voided);
});

it('cancels accepted notices but skips cancellation for notices that never submitted', function (string $notificationStatus, bool $expectsCancellation) {
    $attributes = disbursementAttributes($this);
    $attributes['status'] = AssistanceDisbursementStatus::Ready;
    $attributes['notification_status'] = $notificationStatus;
    $ready = AssistanceDisbursement::query()->create($attributes);
    $notifier = Mockery::mock(AssistanceDisbursementSmsNotifier::class);

    if ($expectsCancellation) {
        $notifier->shouldReceive('voided')->once()->andReturn([
            'status' => 'submitted',
            'phone' => '09171234567',
            'message' => 'Cancelled claim notice.',
            'failure' => null,
            'provider_message_id' => '702',
            'provider_status' => 'Pending',
        ]);
    } else {
        $notifier->shouldNotReceive('voided');
    }

    $voided = (new VoidAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $notifier,
    ))->execute(new VoidAssistanceDisbursementDto(
        assistanceRequestId: $this->requestId,
        disbursementId: $ready->id,
        municipalId: $this->municipalId,
        actorId: $this->actorId,
        reason: 'The ready disbursement requires a reviewed financial correction.',
    ));

    expect($voided->status)->toBe(AssistanceDisbursementStatus::Voided);
})->with([
    'submitted notice' => ['submitted', true],
    'sent notice' => ['sent', true],
    'failed notice' => ['failed', false],
    'unavailable notice' => ['unavailable', false],
]);

it('voids a preparing attempt without sending a cancellation', function () {
    $preparing = AssistanceDisbursement::query()->create(disbursementAttributes($this));
    $notifier = Mockery::mock(AssistanceDisbursementSmsNotifier::class);
    $notifier->shouldNotReceive('voided');

    $voided = (new VoidAssistanceDisbursementAction(
        new LockActionCenterMunicipalityAction,
        new LockAssistanceRequestAction,
        $notifier,
    ))->execute(new VoidAssistanceDisbursementDto(
        assistanceRequestId: $this->requestId,
        disbursementId: $preparing->id,
        municipalId: $this->municipalId,
        actorId: $this->actorId,
        reason: 'The draft financial instrument details were entered incorrectly.',
    ));

    expect($voided->status)->toBe(AssistanceDisbursementStatus::Voided);
});

function disbursementDto(object $test, string $method, string $reference): SaveAssistanceDisbursementDto
{
    return new SaveAssistanceDisbursementDto(
        assistanceRequestId: $test->requestId,
        municipalId: $test->municipalId,
        actorId: $test->actorId,
        method: $method,
        instrumentReferenceNumber: $reference,
        instrumentDate: CarbonImmutable::parse('2026-09-18'),
        claimLocationKey: 'treasury',
        notes: null,
    );
}

/** @return array<string, mixed> */
function disbursementAttributes(object $test): array
{
    return [
        'municipal_id' => $test->municipalId,
        'assistance_request_id' => $test->requestId,
        'attempt_number' => 1,
        'method' => 'check',
        'status' => AssistanceDisbursementStatus::Preparing,
        'amount' => 4000,
        'payee_name' => 'Juan Dela Cruz',
        'instrument_reference_number' => 'CHK-READY-1',
        'instrument_date' => '2026-09-18',
        'claim_location_key' => 'treasury',
        'claim_location_label' => 'Municipal Treasurer\'s Office',
        'claim_instructions' => 'Bring a valid ID.',
        'source_fingerprint' => hash('sha256', 'source'),
        'prepared_by_user_id' => $test->actorId,
        'prepared_at' => now(),
        'metadata' => [],
    ];
}
