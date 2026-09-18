<?php

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Enums\BeneficiaryAssistanceRole;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Beneficiary\ListBeneficiaryAssistanceHistoryAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ListHouseholdAssistanceHistoryAction;
use App\Core\ActionCenter\UseCase\Household\ListHouseholdAssistanceHistoryAction as ListCompleteHouseholdAssistanceHistoryAction;
use App\External\Api\Resources\ActionCenter\BeneficiaryAssistanceHistoryResource;
use App\External\Api\Resources\ActionCenter\BeneficiaryHouseholdAssistanceInvolvementResource;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('beneficiary_id')->nullable();
        $table->ulid('household_id')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id')->nullable();
        $table->ulid('assistance_type_id');
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->string('transaction_number');
        $table->string('status');
        $table->string('mswd_verification_status')->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->json('metadata')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id');
        $table->string('first_name')->nullable();
        $table->string('middle_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('suffix')->nullable();
        $table->timestamps();
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

    $this->municipalId = (string) Str::ulid();
    $this->otherMunicipalId = (string) Str::ulid();
    $this->typeId = (string) Str::ulid();

    DB::table('ac_assistance_types')->insert([
        'id' => $this->typeId,
        'name' => 'MEDICAL ASSISTANCE',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
});

afterEach(function () {
    foreach ([
        'ac_beneficiary_cooldowns',
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_household_members',
        'ac_households',
        'ac_assistance_types',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('shows only assistance intended for the profile owner', function () {
    $filerId = (string) Str::ulid();
    $recipientId = (string) Str::ulid();
    $filerMemberId = historyMember($filerId);
    $recipientMemberId = historyMember($recipientId);

    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0001',
        amount: 1000,
        filerName: ['ANA', 'M.', 'CRUZ', null],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0002',
        amount: 4000,
        filerName: ['ANA', 'M.', 'CRUZ', null],
        assistedMemberId: $recipientMemberId,
        assistedName: ['BEN', null, 'CRUZ', 'JR.'],
    );

    $action = app(ListBeneficiaryAssistanceHistoryAction::class);
    $filerHistory = $action->execute($this->municipalId, historyIdentityGroup([$filerId]));
    $recipientHistory = $action->execute($this->municipalId, historyIdentityGroup([$recipientId]));

    expect($filerHistory->entries)->toHaveCount(1)
        ->and($filerHistory->entries->first()->request->transaction_number)->toBe('REQ-2026-0001')
        ->and($filerHistory->entries->first()->role)->toBe(BeneficiaryAssistanceRole::FiledForSelf)
        ->and($filerHistory->receivedRequestCount)->toBe(1)
        ->and($filerHistory->releasedReceivedCount)->toBe(1)
        ->and($filerHistory->totalReleasedReceivedAmount)->toBe(1000.0)
        ->and($recipientHistory->entries)->toHaveCount(1)
        ->and($recipientHistory->entries->first()->role)->toBe(BeneficiaryAssistanceRole::ReceivedOnBehalf)
        ->and($recipientHistory->totalReleasedReceivedAmount)->toBe(4000.0);

    $payload = (new BeneficiaryAssistanceHistoryResource($recipientHistory->entries->first()))->resolve();

    expect($payload['role'])->toBe('received_on_behalf')
        ->and($payload['filer_full_name'])->toBe('ANA M. CRUZ')
        ->and($payload['subject_full_name'])->toBe('BEN CRUZ JR.')
        ->and($payload['amount_approved'])->toBe(4000.0);
});

it('uses linked historical member identities without guessing from names', function () {
    $canonicalId = (string) Str::ulid();
    $mergedId = (string) Str::ulid();
    $outsideFilerId = (string) Str::ulid();
    $historicalMemberId = historyMember($mergedId, deleted: true);
    $lateLinkedMemberId = historyMember(null);
    $unlinkedMemberId = historyMember(null);

    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $outsideFilerId,
        transaction: 'REQ-2026-0010',
        amount: 1500,
        filerName: ['OLD', null, 'FILER', null],
        assistedMemberId: $historicalMemberId,
        assistedName: ['LINKED', null, 'PERSON', null],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $outsideFilerId,
        transaction: 'REQ-2026-0011',
        amount: 2000,
        filerName: ['LATE', null, 'FILER', null],
        assistedMemberId: $lateLinkedMemberId,
        assistedName: ['LATE', null, 'LINK', null],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $outsideFilerId,
        transaction: 'REQ-2026-0012',
        amount: 3000,
        filerName: ['UNLINKED', null, 'FILER', null],
        assistedMemberId: $unlinkedMemberId,
        assistedName: ['LATE', null, 'LINK', null],
    );
    historyRequest(
        municipalId: $this->otherMunicipalId,
        typeId: $this->typeId,
        filerId: $outsideFilerId,
        transaction: 'REQ-2026-0013',
        amount: 9000,
        filerName: ['OTHER', null, 'LGU', null],
        assistedMemberId: $historicalMemberId,
        assistedName: ['LINKED', null, 'PERSON', null],
    );

    DB::table('ac_household_members')
        ->where('id', $lateLinkedMemberId)
        ->update(['beneficiary_id' => $canonicalId]);

    $history = app(ListBeneficiaryAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        historyIdentityGroup([$canonicalId, $mergedId]),
    );

    expect($history->entries)->toHaveCount(2)
        ->and($history->entries->pluck('request.transaction_number')->sort()->values()->all())->toBe([
            'REQ-2026-0010',
            'REQ-2026-0011',
        ])
        ->and($history->entries->every(
            fn ($entry): bool => $entry->role === BeneficiaryAssistanceRole::ReceivedOnBehalf,
        ))->toBeTrue()
        ->and($history->totalReleasedReceivedAmount)->toBe(3500.0);
});

it('keeps personal requests separate while preserving current and former household involvement', function () {
    $currentHouseholdId = (string) Str::ulid();
    $formerHouseholdId = (string) Str::ulid();
    historyHousehold($currentHouseholdId, $this->municipalId, 'HH-CURRENT');
    historyHousehold($formerHouseholdId, $this->municipalId, 'HH-FORMER');
    $filerId = (string) Str::ulid();
    $recipientId = (string) Str::ulid();
    $currentMemberId = historyMember($recipientId, householdId: $currentHouseholdId);
    $formerMemberId = historyMember($recipientId, deleted: true, householdId: $formerHouseholdId);
    $otherMemberId = historyMember((string) Str::ulid(), householdId: $currentHouseholdId);

    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0020',
        amount: 1000,
        filerName: ['CURRENT', null, 'HEAD', null],
        householdId: $currentHouseholdId,
        status: 'pending',
        filingHouseholdMembers: [historySnapshotMember($recipientId, $currentMemberId)],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0021',
        amount: 5000,
        filerName: ['CURRENT', null, 'HEAD', null],
        assistedMemberId: $currentMemberId,
        assistedName: ['HOUSEHOLD', null, 'MEMBER', null],
        householdId: $currentHouseholdId,
        filingHouseholdMembers: [historySnapshotMember($recipientId, $currentMemberId)],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $recipientId,
        transaction: 'REQ-2026-0022',
        amount: 9000,
        filerName: ['HOUSEHOLD', null, 'MEMBER', null],
        householdId: $formerHouseholdId,
        filingHouseholdMembers: [historySnapshotMember($recipientId, $formerMemberId)],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0026',
        amount: 3500,
        filerName: ['FORMER', null, 'HEAD', null],
        householdId: $formerHouseholdId,
        filingHouseholdMembers: [historySnapshotMember($recipientId, $formerMemberId)],
    );
    historyRequest(
        municipalId: $this->otherMunicipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0023',
        amount: 12000,
        filerName: ['OTHER', null, 'LGU', null],
        householdId: $currentHouseholdId,
        filingHouseholdMembers: [historySnapshotMember($recipientId, $currentMemberId)],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0024',
        amount: 8000,
        filerName: ['BEFORE', null, 'TRANSFER', null],
        householdId: $currentHouseholdId,
        filingHouseholdMembers: [historySnapshotMember(null, $otherMemberId)],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0025',
        amount: 7000,
        filerName: ['LEGACY', null, 'REQUEST', null],
        householdId: $currentHouseholdId,
    );

    $history = app(ListHouseholdAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        historyIdentityGroup([$recipientId]),
    );
    $personalHistory = app(ListBeneficiaryAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        historyIdentityGroup([$recipientId]),
    );

    expect($history)->toHaveCount(2)
        ->and($history->pluck('request.transaction_number')->sort()->values()->all())->toBe([
            'REQ-2026-0020',
            'REQ-2026-0026',
        ])
        ->and($personalHistory->entries->pluck('request.transaction_number')->sort()->values()->all())->toBe([
            'REQ-2026-0021',
            'REQ-2026-0022',
        ])
        ->and($personalHistory->totalReleasedReceivedAmount)->toBe(14000.0);

    $formerEntry = $history->first(
        fn ($entry): bool => $entry->request->transaction_number === 'REQ-2026-0026',
    );
    $payload = (new BeneficiaryHouseholdAssistanceInvolvementResource($formerEntry))->resolve();

    expect($payload['household_code'])->toBe('HH-FORMER')
        ->and($payload['filer_full_name'])->toBe('FORMER HEAD')
        ->and($payload['subject_full_name'])->toBe('FORMER HEAD')
        ->and($payload['cooldown']['state'])->toBe('legacy_unavailable');
});

it('uses the assessment roster as authoritative over the filing roster', function () {
    $householdId = (string) Str::ulid();
    historyHousehold($householdId, $this->municipalId, 'HH-ASSESSMENT');
    $personId = (string) Str::ulid();
    $personMemberId = historyMember($personId, householdId: $householdId);
    $otherMemberId = historyMember((string) Str::ulid(), householdId: $householdId);
    $filerId = (string) Str::ulid();

    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0030',
        amount: 1000,
        filerName: ['REMOVED', null, 'PERSON', null],
        householdId: $householdId,
        filingHouseholdMembers: [historySnapshotMember($personId, $personMemberId)],
        assessmentHouseholdMembers: [historySnapshotMember(null, $otherMemberId)],
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0031',
        amount: 2000,
        filerName: ['ADDED', null, 'PERSON', null],
        householdId: $householdId,
        filingHouseholdMembers: [historySnapshotMember(null, $otherMemberId)],
        assessmentHouseholdMembers: [historySnapshotMember($personId, $personMemberId)],
    );

    $history = app(ListHouseholdAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        historyIdentityGroup([$personId]),
    );

    expect($history)->toHaveCount(1)
        ->and($history->first()->request->transaction_number)->toBe('REQ-2026-0031');
});

it('matches merged and historical member links without matching unlinked names', function () {
    $householdId = (string) Str::ulid();
    historyHousehold($householdId, $this->municipalId, 'HH-MERGED');
    $canonicalId = (string) Str::ulid();
    $mergedId = (string) Str::ulid();
    $historicalMemberId = historyMember($mergedId, deleted: true, householdId: $householdId);
    $lateLinkedMemberId = historyMember(null, householdId: $householdId);
    $unlinkedMemberId = historyMember(null, householdId: $householdId);
    $filerId = (string) Str::ulid();

    foreach ([
        ['REQ-2026-0040', $historicalMemberId, 'HISTORICAL'],
        ['REQ-2026-0041', $lateLinkedMemberId, 'LATE LINK'],
        ['REQ-2026-0042', $unlinkedMemberId, 'SAME NAME'],
    ] as [$transaction, $memberId, $name]) {
        historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: $filerId,
            transaction: $transaction,
            amount: 1000,
            filerName: [$name, null, 'FILER', null],
            householdId: $householdId,
            filingHouseholdMembers: [historySnapshotMember(null, $memberId, 'SAME PERSON')],
        );
    }

    DB::table('ac_household_members')
        ->where('id', $lateLinkedMemberId)
        ->update(['beneficiary_id' => $canonicalId]);

    $history = app(ListHouseholdAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        historyIdentityGroup([$canonicalId, $mergedId]),
    );

    expect($history->pluck('request.transaction_number')->sort()->values()->all())->toBe([
        'REQ-2026-0040',
        'REQ-2026-0041',
    ]);
});

it('returns household involvement across every request status', function () {
    $householdId = (string) Str::ulid();
    $personId = (string) Str::ulid();
    historyHousehold($householdId, $this->municipalId, 'HH-STATUS');
    $memberId = historyMember($personId, householdId: $householdId);

    foreach (['pending', 'under_review', 'approved', 'released', 'rejected', 'cancelled'] as $index => $status) {
        historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: sprintf('REQ-2026-01%02d', $index),
            amount: 1000 + $index,
            filerName: ['OTHER', null, strtoupper($status), null],
            householdId: $householdId,
            status: $status,
            filingHouseholdMembers: [historySnapshotMember($personId, $memberId)],
        );
    }

    $history = app(ListHouseholdAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        historyIdentityGroup([$personId]),
    );

    expect($history)->toHaveCount(6)
        ->and($history->pluck('request.status')->map->value->all())
        ->toEqualCanonicalizing(['pending', 'under_review', 'approved', 'released', 'rejected', 'cancelled']);
});

it('reports frozen release cooldown outcomes for household involvement', function () {
    $now = CarbonImmutable::parse('2026-09-17 10:00:00');
    CarbonImmutable::setTestNow($now);

    try {
        $householdId = (string) Str::ulid();
        $personId = (string) Str::ulid();
        historyHousehold($householdId, $this->municipalId, 'HH-COOLDOWN');
        $memberId = historyMember($personId, householdId: $householdId);
        $snapshot = [historySnapshotMember($personId, $memberId)];
        $policy = [
            'type' => 'per_request',
            'scope' => 'per_household',
            'months' => 3,
            'captured_beneficiary_ids' => [$personId],
        ];

        historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-UNRELEASED',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            status: 'approved',
            filingHouseholdMembers: $snapshot,
        );
        $activeId = historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-ACTIVE',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            filingHouseholdMembers: $snapshot,
            cooldownPolicy: $policy,
        );
        historyCooldown($personId, $activeId, $this->typeId, $householdId, $memberId, $now->subMonth(), $now->addMonths(2));

        $expiredId = historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-EXPIRED',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            filingHouseholdMembers: $snapshot,
            cooldownPolicy: $policy,
        );
        historyCooldown($personId, $expiredId, $this->typeId, $householdId, $memberId, $now->subMonths(4), $now->subMonth());

        $permanentId = historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-PERMANENT',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            filingHouseholdMembers: $snapshot,
            cooldownPolicy: ['type' => 'one_time', 'scope' => 'per_household', 'months' => 0],
        );
        historyCooldown($personId, $permanentId, $this->typeId, $householdId, $memberId, $now->subMonth(), null);

        historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-NONE',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            filingHouseholdMembers: $snapshot,
            cooldownPolicy: ['type' => 'per_request', 'scope' => 'per_household', 'months' => 0],
        );
        historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-NOT-CAPTURED',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            filingHouseholdMembers: $snapshot,
            cooldownPolicy: array_replace($policy, ['captured_beneficiary_ids' => []]),
        );
        historyRequest(
            municipalId: $this->municipalId,
            typeId: $this->typeId,
            filerId: (string) Str::ulid(),
            transaction: 'REQ-CD-LEGACY',
            amount: 1000,
            filerName: ['OTHER', null, 'PERSON', null],
            householdId: $householdId,
            filingHouseholdMembers: $snapshot,
        );

        $history = app(ListHouseholdAssistanceHistoryAction::class)->execute(
            $this->municipalId,
            historyIdentityGroup([$personId]),
        )->keyBy(fn ($entry): string => $entry->request->transaction_number);

        expect($history['REQ-CD-UNRELEASED']->cooldownState)->toBe('unreleased')
            ->and($history['REQ-CD-ACTIVE']->cooldownState)->toBe('active')
            ->and($history['REQ-CD-EXPIRED']->cooldownState)->toBe('expired')
            ->and($history['REQ-CD-PERMANENT']->cooldownState)->toBe('permanent')
            ->and($history['REQ-CD-NONE']->cooldownState)->toBe('none_configured')
            ->and($history['REQ-CD-NOT-CAPTURED']->cooldownState)->toBe('not_captured')
            ->and($history['REQ-CD-LEGACY']->cooldownState)->toBe('legacy_unavailable');
    } finally {
        CarbonImmutable::setTestNow();
    }
});

it('lists every request stored under one tenant household', function () {
    $householdId = (string) Str::ulid();
    $otherHouseholdId = (string) Str::ulid();
    $filerId = (string) Str::ulid();

    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0050',
        amount: 0,
        filerName: ['ANA', null, 'CRUZ', null],
        householdId: $householdId,
        status: 'pending',
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0051',
        amount: 2500,
        filerName: ['ANA', null, 'CRUZ', null],
        householdId: $householdId,
        status: 'released',
    );
    historyRequest(
        municipalId: $this->municipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0052',
        amount: 9000,
        filerName: ['ANA', null, 'CRUZ', null],
        householdId: $otherHouseholdId,
        status: 'released',
    );
    historyRequest(
        municipalId: $this->otherMunicipalId,
        typeId: $this->typeId,
        filerId: $filerId,
        transaction: 'REQ-2026-0053',
        amount: 12000,
        filerName: ['ANA', null, 'CRUZ', null],
        householdId: $householdId,
        status: 'released',
    );

    $history = app(ListCompleteHouseholdAssistanceHistoryAction::class)->execute(
        $this->municipalId,
        $householdId,
    );

    expect($history->entries->pluck('request.transaction_number')->all())
        ->toEqualCanonicalizing(['REQ-2026-0050', 'REQ-2026-0051'])
        ->and($history->requestCount)->toBe(2)
        ->and($history->releasedCount)->toBe(1)
        ->and($history->totalReleasedAmount)->toBe(2500.0);
});

function historyIdentityGroup(array $beneficiaryIds, array $householdIds = []): BeneficiaryIdentityGroup
{
    $beneficiary = new Beneficiary;
    $beneficiary->setAttribute('id', $beneficiaryIds[0]);

    return new BeneficiaryIdentityGroup($beneficiary, $beneficiaryIds, $householdIds);
}

function historyHousehold(string $id, string $municipalId, string $code): void
{
    DB::table('ac_households')->insert([
        'id' => $id,
        'municipal_id' => $municipalId,
        'household_code' => $code,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function historyMember(
    ?string $beneficiaryId,
    bool $deleted = false,
    ?string $householdId = null,
): string {
    $id = (string) Str::ulid();
    DB::table('ac_household_members')->insert([
        'id' => $id,
        'beneficiary_id' => $beneficiaryId,
        'household_id' => $householdId,
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => $deleted ? now() : null,
    ]);

    return $id;
}

function historyCooldown(
    string $beneficiaryId,
    string $requestId,
    string $typeId,
    string $householdId,
    ?string $memberId,
    CarbonImmutable $startsAt,
    ?CarbonImmutable $expiresAt,
): void {
    DB::table('ac_beneficiary_cooldowns')->insert([
        'id' => (string) Str::ulid(),
        'beneficiary_id' => $beneficiaryId,
        'assistance_type_id' => $typeId,
        'assistance_request_id' => $requestId,
        'household_member_id' => $memberId,
        'household_id' => $householdId,
        'cooldown_starts_at' => $startsAt,
        'cooldown_expires_at' => $expiresAt,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

/** @return array{household_member_id:?string, beneficiary_id:?string, full_name:string} */
function historySnapshotMember(?string $beneficiaryId, ?string $memberId, string $name = 'HOUSEHOLD MEMBER'): array
{
    return [
        'household_member_id' => $memberId,
        'beneficiary_id' => $beneficiaryId,
        'full_name' => $name,
    ];
}

/**
 * @param  array{0:string, 1:?string, 2:string, 3:?string}  $filerName
 * @param  array{0:string, 1:?string, 2:string, 3:?string}|null  $assistedName
 */
function historyRequest(
    string $municipalId,
    string $typeId,
    string $filerId,
    string $transaction,
    float $amount,
    array $filerName,
    ?string $assistedMemberId = null,
    ?array $assistedName = null,
    ?string $householdId = null,
    string $status = 'released',
    ?array $filingHouseholdMembers = null,
    ?array $assessmentHouseholdMembers = null,
    ?array $cooldownPolicy = null,
): string {
    $requestId = (string) Str::ulid();
    $metadata = [];

    if ($assistedMemberId !== null) {
        $metadata = [
            'relationship_to_beneficiary' => 'child',
            'on_behalf_first_name' => $assistedName[0],
            'on_behalf_middle_name' => $assistedName[1],
            'on_behalf_last_name' => $assistedName[2],
            'on_behalf_suffix' => $assistedName[3],
        ];
    }

    if ($filingHouseholdMembers !== null) {
        $metadata['household_composition_snapshot'] = [
            'captured_at' => now()->toIso8601String(),
            'members' => $filingHouseholdMembers,
        ];
    }

    if ($assessmentHouseholdMembers !== null) {
        $metadata['household_assessment_snapshot'] = [
            'captured_at' => now()->toIso8601String(),
            'members' => $assessmentHouseholdMembers,
        ];
    }

    if ($cooldownPolicy !== null) {
        $metadata['cooldown_policy'] = $cooldownPolicy;
    }

    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'beneficiary_id' => $filerId,
        'household_id' => $householdId,
        'assistance_type_id' => $typeId,
        'on_behalf_household_member_id' => $assistedMemberId,
        'transaction_number' => $transaction,
        'status' => $status,
        'mswd_verification_status' => 'verified',
        'amount_approved' => $amount,
        'metadata' => $metadata === [] ? null : json_encode($metadata, JSON_THROW_ON_ERROR),
        'released_at' => $status === 'released' ? now() : null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => $filerName[0],
        'middle_name' => $filerName[1],
        'last_name' => $filerName[2],
        'suffix' => $filerName[3],
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $requestId;
}
