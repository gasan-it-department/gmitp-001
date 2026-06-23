<?php

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use App\Core\Cemetery\Models\IntermentReadinessOverride;
use App\Core\Cemetery\Models\UnidentifiedDetail;
use Illuminate\Support\Collection;

uses(Tests\TestCase::class);

it('derives fetal infant child and adult life stages', function () {
    expect(decedentForStage('fetal_death', null, null)->life_stage)->toBe('fetal')
        ->and(decedentForStage('death', '2025-01-01', '2025-06-01')->life_stage)->toBe('infant')
        ->and(decedentForStage('death', '2015-01-01', '2025-01-01')->life_stage)->toBe('child')
        ->and(decedentForStage('death', '2000-01-01', '2025-01-01')->life_stage)->toBe('adult');
});

it('requires an attached death certificate and burial permit for an identified death', function () {
    $decedent = readyDecedent('death', 'identified', [
        attachedDocument('death_certificate'),
    ]);

    $readiness = (new GetIntermentReadinessAction)->execute($decedent);

    expect($readiness['ready'])->toBeFalse()
        ->and($readiness['missing'])->toBe(['burial_permit']);
});

it('uses the fetal death certificate requirement for fetal records', function () {
    $decedent = readyDecedent('fetal_death', 'identified', [
        attachedDocument('fetal_death_certificate'),
        attachedDocument('burial_permit'),
    ]);

    $readiness = (new GetIntermentReadinessAction)->execute($decedent);

    expect($readiness['ready'])->toBeTrue()
        ->and($readiness['missing'])->toBe([]);
});

it('adds police and applicable medico legal evidence for unidentified cases', function () {
    $decedent = readyDecedent('death', 'unidentified', [
        attachedDocument('death_certificate'),
        attachedDocument('burial_permit'),
        attachedDocument('police_report'),
    ]);
    $decedent->setRelation('unidentifiedDetail', new UnidentifiedDetail(['requires_medico_legal' => true]));

    $readiness = (new GetIntermentReadinessAction)->execute($decedent);

    expect($readiness['ready'])->toBeFalse()
        ->and($readiness['missing'])->toBe(['medico_legal_report']);
});

it('accepts only an unexpired unused override and marks readiness as overridden', function () {
    $decedent = readyDecedent('death', 'identified', []);
    $decedent->setRelation('readinessOverrides', new Collection([
        new IntermentReadinessOverride([
            'id' => 'override-1',
            'evidence_reference' => 'PHYSICAL-DOC-1',
            'expires_at' => now()->addDay(),
            'consumed_at' => null,
        ]),
    ]));

    $readiness = (new GetIntermentReadinessAction)->execute($decedent);

    expect($readiness['ready'])->toBeTrue()
        ->and($readiness['via_override'])->toBeTrue()
        ->and($readiness['override']['id'])->toBe('override-1');
});

it('rejects expired or consumed overrides and never bypasses registration verification', function () {
    $decedent = readyDecedent('death', 'identified', []);
    $decedent->registration_status = 'pending_review';
    $decedent->setRelation('readinessOverrides', new Collection([
        new IntermentReadinessOverride([
            'id' => 'expired',
            'evidence_reference' => 'OLD',
            'expires_at' => now()->subMinute(),
        ]),
        new IntermentReadinessOverride([
            'id' => 'consumed',
            'evidence_reference' => 'USED',
            'expires_at' => now()->addDay(),
            'consumed_at' => now(),
        ]),
    ]));

    $readiness = (new GetIntermentReadinessAction)->execute($decedent);

    expect($readiness['ready'])->toBeFalse()
        ->and($readiness['via_override'])->toBeFalse()
        ->and($readiness['override'])->toBeNull();
});

function decedentForStage(string $vitalType, ?string $birthDate, ?string $deathDate): Decedent
{
    return new Decedent([
        'vital_record_type' => $vitalType,
        'date_of_birth' => $birthDate,
        'date_of_death' => $deathDate,
    ]);
}

function readyDecedent(string $vitalType, string $identityStatus, array $documents): Decedent
{
    $decedent = new Decedent([
        'vital_record_type' => $vitalType,
        'identity_status' => $identityStatus,
        'registration_status' => 'verified',
    ]);
    $decedent->setRelation('documents', new Collection($documents));
    $decedent->setRelation('unidentifiedDetail', null);
    $decedent->setRelation('readinessOverrides', new Collection);

    return $decedent;
}

function attachedDocument(string $type): DecedentDocument
{
    return new DecedentDocument([
        'type' => $type,
    ]);
}
