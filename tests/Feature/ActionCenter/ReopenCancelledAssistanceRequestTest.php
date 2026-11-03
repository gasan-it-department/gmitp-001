<?php

use App\Core\ActionCenter\Dto\Assistance\ReopenCancelledAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\Services\CancelledAssistanceRecoveryService;
use App\Core\ActionCenter\UseCase\Assistance\ReopenCancelledAssistanceRequestAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';

beforeEach(function () {
    goodsDistributionFixture($this);
    $this->actor->givePermissionTo(['action_center.access', 'action_center.requests.view', 'action_center.requests.decide', 'action_center.requests.correct']);
    Schema::create('ac_assistance_types', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('municipal_id');
        $t->string('name');
        $t->string('slug');
        $t->boolean('is_active')->default(true);
        $t->timestamps();
        $t->softDeletes();
    });
    Schema::create('ac_assistance_requests', function (Blueprint $t) {
        $t->ulid('id')->primary();
        foreach (['municipal_id', 'beneficiary_id', 'household_id', 'assistance_type_id'] as $field) {
            $t->ulid($field);
        }
        foreach (['approved_by_user_id', 'cancelled_by_user_id', 'released_by_user_id', 'reviewed_by_user_id', 'on_behalf_household_member_id'] as $field) {
            $t->ulid($field)->nullable();
        }
        $t->string('transaction_number');
        $t->string('status');
        $t->decimal('amount_approved', 16, 2)->nullable();
        foreach (['approved_at', 'cancelled_at', 'released_at', 'reviewed_at'] as $field) {
            $t->timestamp($field)->nullable();
        }
        $t->string('release_reference_number')->nullable();
        $t->text('remarks')->nullable();
        $t->json('metadata')->nullable();
        $t->string('mswd_verification_status')->nullable();
        $t->string('mswd_verification_fingerprint')->nullable();
        $t->timestamps();
        $t->softDeletes();
    });
    Schema::create('ac_assistance_type_documents', function (Blueprint $t) {
        $t->ulid('assistance_type_id');
        $t->ulid('document_type_id');
        $t->boolean('is_required')->default(true);
        $t->string('physical_copy_requirement')->default('unspecified');
        $t->integer('sort_order')->default(0);
        $t->timestamps();
    });
    (require database_path('migrations/2025_12_31_025253_create_ac_beneficiary_flags_table.php'))->up();
    (require database_path('migrations/2026_01_21_142715_create_ac_beneficiary_cooldowns_table.php'))->up();
    Schema::create('ac_assistance_disbursements', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('assistance_request_id');
        $t->string('status');
    });
    $this->type = AssistanceType::create(['municipal_id' => $this->municipalId, 'name' => 'Medical', 'slug' => 'medical', 'is_active' => true]);
    $this->record = AssistanceRequest::create(['municipal_id' => $this->municipalId, 'beneficiary_id' => $this->filer->id,
        'household_id' => $this->household->id, 'assistance_type_id' => $this->type->id, 'transaction_number' => 'REQ-RECOVERY-1',
        'status' => 'cancelled', 'amount_approved' => '5000.00', 'approved_at' => now()->subDay(), 'approved_by_user_id' => $this->actor->id,
        'cancelled_at' => now(), 'cancelled_by_user_id' => $this->actor->id, 'remarks' => 'Cancelled because the amount was wrong.',
        'mswd_verification_status' => 'verified', 'mswd_verification_fingerprint' => str_repeat('a', 64),
        'metadata' => ['household_assessment_snapshot' => ['preserve' => true], 'cooldown_exception_authorization' => ['old' => true]]]);
    $this->dto = new ReopenCancelledAssistanceRequestDto($this->record->id, $this->municipalId, $this->actor->id,
        'Recover the mistakenly cancelled award.', app(CancelledAssistanceRecoveryService::class)->token($this->record), (string) Str::uuid(), true, true);
    $this->sms = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $this->sms->shouldReceive('requestReopened')->byDefault();
    app()->instance(AssistanceRequestSmsNotifier::class, $this->sms);
});

afterEach(function () {
    foreach (['ac_assistance_disbursements', 'ac_beneficiary_cooldowns', 'ac_beneficiary_flags', 'ac_assistance_requests', 'ac_assistance_type_documents', 'ac_assistance_types'] as $table) {
        Schema::dropIfExists($table);
    }
    goodsDistributionCleanup();
});

it('recovers the same request without restoring approval or changing verified evidence', function () {
    $this->sms->shouldReceive('requestReopened')->once();
    $request = app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto);
    expect($request->id)->toBe($this->record->id)->and($request->transaction_number)->toBe('REQ-RECOVERY-1')
        ->and($request->status)->toBe(AssistanceStatus::Pending)->and($request->amount_approved)->toBeNull()
        ->and($request->approved_at)->toBeNull()->and($request->cancelled_at)->toBeNull()
        ->and($request->mswd_verification_fingerprint)->toBe(str_repeat('a', 64))
        ->and(data_get($request->metadata, 'household_assessment_snapshot.preserve'))->toBeTrue()
        ->and(data_get($request->metadata, 'cooldown_exception_authorization'))->toBeNull()
        ->and(data_get($request->metadata, 'reopen_history.0.approved_amount'))->toBe('5000.00');
    app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto);
    expect(AssistanceRequest::count())->toBe(1)->and(count($request->fresh()->metadata['reopen_history']))->toBe(1)
        ->and(DB::table('activity_log')->where('description', 'Reopened cancelled assistance request for review')->count())->toBe(1);
});

it('rejects concurrent stale reviews and conflicting operation retries', function () {
    app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto);
    $dto = $this->dto;
    expect(fn () => app(ReopenCancelledAssistanceRequestAction::class)->execute(new ReopenCancelledAssistanceRequestDto($dto->requestId, $dto->municipalId, $dto->actorId, 'Different reviewed reason.', $dto->contextToken, $dto->operationKey, true, true)))->toThrow(DomainException::class, 'different input');
    expect(fn () => app(ReopenCancelledAssistanceRequestAction::class)->execute(new ReopenCancelledAssistanceRequestDto($dto->requestId, $dto->municipalId, $dto->actorId, $dto->reason, $dto->contextToken, (string) Str::uuid(), true, true)))->toThrow(DomainException::class, 'Refresh');
});

it('keeps cancelled rows locked to generic updates', function () {
    expect(fn () => $this->record->update(['status' => 'pending']))->toThrow(DomainException::class, 'immutable');
});

it('rejects active and released payment records but permits voided history', function (string $status) {
    DB::table('ac_assistance_disbursements')->insert(['id' => (string) Str::ulid(), 'assistance_request_id' => $this->record->id, 'status' => $status]);
    $blocker = app(CancelledAssistanceRecoveryService::class)->blocker($this->record);
    expect($blocker === null)->toBe($status === 'voided');
})->with(['preparing', 'ready', 'released', 'voided']);

it('checks conflicting applications independently of pending identity verification', function () {
    $other = $this->record->replicate();
    $other->id = (string) Str::ulid();
    $other->status = 'pending';
    $other->transaction_number = 'REQ-REPLACEMENT';
    $other->save();
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record))->toContain('REQ-REPLACEMENT');
});

it('requires both capabilities and tenant ownership', function () {
    $this->actor->revokePermissionTo('action_center.requests.correct');
    expect(fn () => app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto))->toThrow(\Illuminate\Auth\Access\AuthorizationException::class);
    $this->actor->givePermissionTo('action_center.requests.correct');
    $dto = $this->dto;
    expect(fn () => app(ReopenCancelledAssistanceRequestAction::class)->execute(new ReopenCancelledAssistanceRequestDto($dto->requestId, $this->otherMunicipalId, $dto->actorId, $dto->reason, $dto->contextToken, $dto->operationKey, true, true)))->toThrow(\Illuminate\Auth\Access\AuthorizationException::class);
});

it('excludes preapproval cancellations and release artifacts', function () {
    DB::table('ac_assistance_requests')->where('id', $this->record->id)->update(['approved_at' => null]);
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record->fresh()))->toContain('previously approved');
    DB::table('ac_assistance_requests')->where('id', $this->record->id)->update(['approved_at' => now(), 'release_reference_number' => 'PAID']);
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record->fresh()))->toContain('Release information');
});

it('allows a fresh correct approval and retains multiple recovery cycles', function () {
    $this->sms->shouldReceive('requestApproved')->once();
    $request = app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto);
    $evaluation = app(\App\Core\ActionCenter\Services\AssistanceCooldownService::class)->evaluate($this->filer, $this->type, excludeRequestId: $request->id);
    expect(fn () => app(\App\Core\ActionCenter\UseCase\Assistance\ApproveAssistanceRequestAction::class)->execute(new \App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto(
        $request->id, $this->municipalId, null, $this->actor->id, 5000, 'Stale old approval attempt.', $evaluation->advisory->contextFingerprint)))->toThrow(DomainException::class, 'was reopened');
    $approved = app(\App\Core\ActionCenter\UseCase\Assistance\ApproveAssistanceRequestAction::class)->execute(new \App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto(
        $request->id, $this->municipalId, null, $this->actor->id, 2500, 'Correct amount after recovery.', $evaluation->advisory->contextFingerprint, reopenOperationKey: $this->dto->operationKey));
    expect($approved->status)->toBe(AssistanceStatus::Approved)->and($approved->amount_approved)->toBe('2500.00');
    app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto);
    expect($approved->fresh()->amount_approved)->toBe('2500.00');
    $approved->update(['status' => 'cancelled', 'cancelled_at' => now(), 'cancelled_by_user_id' => $this->actor->id]);
    $next = new ReopenCancelledAssistanceRequestDto($request->id, $this->municipalId, $this->actor->id, 'Second mistaken cancellation recovery.', app(CancelledAssistanceRecoveryService::class)->token($approved->fresh()), (string) Str::uuid(), true, true);
    $reopened = app(ReopenCancelledAssistanceRequestAction::class)->execute($next);
    expect($reopened->metadata['reopen_history'])->toHaveCount(2)->and($reopened->amount_approved)->toBeNull();
});

it('checks merged identity conflicts and blacklist restrictions without name matching', function () {
    $duplicate = $this->filer->replicate();
    $duplicate->id = (string) Str::ulid();
    $duplicate->merged_into_beneficiary_id = $this->filer->id;
    $duplicate->save();
    $other = $this->record->replicate();
    $other->id = (string) Str::ulid();
    $other->beneficiary_id = $duplicate->id;
    $other->status = 'pending';
    $other->transaction_number = 'MERGED-REPLACEMENT';
    $other->save();
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record))->toContain('MERGED-REPLACEMENT');
    $other->delete();
    \App\Core\ActionCenter\Models\BeneficiaryFlag::create(['beneficiary_id' => $duplicate->id, 'severity' => 'blacklist', 'reason' => 'Test restriction']);
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record))->toContain('blacklist');
});

it('requires a reason and confirmations without changing the cancelled record', function () {
    $dto = $this->dto;
    expect(fn () => app(ReopenCancelledAssistanceRequestAction::class)->execute(new ReopenCancelledAssistanceRequestDto($dto->requestId, $dto->municipalId, $dto->actorId, 'short', $dto->contextToken, $dto->operationKey, false, true)))->toThrow(DomainException::class);
    expect($this->record->fresh()->status)->toBe(AssistanceStatus::Cancelled)->and(data_get($this->record->fresh()->metadata, 'reopen_history'))->toBeNull();
});

it('keeps timed cooldowns advisory while blocking a prior one-time release', function () {
    $paid = $this->record->replicate();
    $paid->id = (string) Str::ulid();
    $paid->status = 'released';
    $paid->released_at = now()->subDay();
    $paid->save();
    $cooldown = \App\Core\ActionCenter\Models\BeneficiaryCooldown::create([
        'beneficiary_id' => $this->filer->id, 'assistance_type_id' => $this->type->id, 'assistance_request_id' => $paid->id,
        'household_id' => $this->household->id, 'cooldown_starts_at' => now()->subDay(), 'cooldown_expires_at' => null,
    ]);
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record))->toContain('one-time');
    $cooldown->update(['cooldown_expires_at' => now()->addMonth()]);
    expect(app(CancelledAssistanceRecoveryService::class)->blocker($this->record))->toBeNull();
    app(ReopenCancelledAssistanceRequestAction::class)->execute($this->dto);
    expect($cooldown->fresh()->cooldown_expires_at->isFuture())->toBeTrue();
});

it('protects the HTTP command with both capabilities and validates confirmations', function () {
    $this->withoutMiddleware([\App\Http\Middleware\Municipality\SetMunicipalityContext::class, \App\Http\Middleware\Admin\AdminGuardMiddleware::class, \App\Http\Middleware\HandleInertiaRequests::class]);
    $this->actingAs($this->actor);
    $url = '/api/action-center/assistance-request/'.$this->record->id.'/reopen-cancelled';
    $this->post($url, [])->assertSessionHasErrors(['reason', 'context_token', 'operation_key', 'confirm_not_released', 'confirm_papers_invalid']);
    $this->actor->revokePermissionTo('action_center.requests.correct');
    $this->post($url, [])->assertForbidden();
    $this->actor->givePermissionTo('action_center.requests.correct');
    $this->post($url, ['reason' => $this->dto->reason, 'context_token' => $this->dto->contextToken, 'operation_key' => $this->dto->operationKey,
        'confirm_not_released' => true, 'confirm_papers_invalid' => true], ['X-Municipality-Slug' => 'inventory-test'])->assertRedirect()->assertSessionHasNoErrors();
    expect($this->record->fresh()->status)->toBe(AssistanceStatus::Pending);
});

it('serializes competing recovery commands on PostgreSQL', function (bool $identical) {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires PostgreSQL row locks.');
    }
    $config = config('database.connections.pgsql');
    $env = ['APP_ENV' => 'testing', 'DB_CONNECTION' => 'pgsql', 'DB_DATABASE' => DB::connection()->getDatabaseName(),
        'DB_HOST' => $config['host'], 'DB_PORT' => $config['port'], 'DB_USERNAME' => $config['username'], 'DB_PASSWORD' => $config['password'],
        'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'array', 'QUEUE_CONNECTION' => 'sync'];
    $workers = [];
    DB::beginTransaction();
    try {
        DB::table('municipalities')->where('id', $this->municipalId)->lockForUpdate()->first();
        for ($i = 0; $i < 2; $i++) {
            $data = get_object_vars($this->dto);
            if ($i && ! $identical) {
                $data['operationKey'] = (string) Str::uuid();
            }
            $worker = new \Symfony\Component\Process\Process([PHP_BINARY, 'tests/Support/AssistanceRecoveryWorker.php'], base_path(), $env, json_encode($data, JSON_THROW_ON_ERROR), 30);
            $worker->start();
            $workers[] = $worker;
        }
        $deadline = microtime(true) + 15;
        do {
            $pids = [];
            foreach ($workers as $worker) {
                if (preg_match('/READY:(\d+)/', $worker->getOutput(), $match)) {
                    $pids[] = (int) $match[1];
                }
            }
            DB::select('SELECT pg_stat_clear_snapshot()');
            $blocked = count($pids) === 2 ? DB::table('pg_stat_activity')->whereIn('pid', $pids)->where('wait_event_type', 'Lock')->count() : 0;
            if ($blocked === 2) {
                break;
            }
            usleep(20000);
        } while (microtime(true) < $deadline);
        expect($blocked)->toBe(2, implode("\n", array_map(fn ($worker) => $worker->getOutput().$worker->getErrorOutput(), $workers)));
        DB::commit();
        $results = [];
        foreach ($workers as $worker) {
            $worker->wait();
            expect($worker->getExitCode())->toBe(0, $worker->getErrorOutput());
            $lines = explode("\n", trim($worker->getOutput()));
            $results[] = json_decode(end($lines), true, flags: JSON_THROW_ON_ERROR);
        }
        expect(collect($results)->where('ok', true)->count())->toBe($identical ? 2 : 1)
            ->and($this->record->fresh()->metadata['reopen_history'])->toHaveCount(1);
    } finally {
        if (DB::transactionLevel()) {
            DB::rollBack();
        }
        foreach ($workers as $worker) {
            if ($worker->isRunning()) {
                $worker->stop();
            }
        }
    }
})->with([true, false]);
