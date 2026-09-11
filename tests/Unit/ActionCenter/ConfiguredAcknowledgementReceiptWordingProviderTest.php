<?php

use App\Core\ActionCenter\Services\ConfiguredAcknowledgementReceiptWordingProvider;
use Illuminate\Config\Repository;

function acknowledgementReceiptWordingProvider(array $config): ConfiguredAcknowledgementReceiptWordingProvider
{
    return new ConfiguredAcknowledgementReceiptWordingProvider(new Repository([
        'action_center_acknowledgement_receipts' => $config,
    ]));
}

it('uses the assistance type and default AICS program when no override exists', function () {
    $provider = acknowledgementReceiptWordingProvider(
        require dirname(__DIR__, 3).'/config/action_center_acknowledgement_receipts.php',
    );

    $wording = $provider->for('1704003000', 'medical-assistance');

    expect($wording->resolvedAssistanceLabel('Medical Assistance'))->toBe('Medical Assistance')
        ->and($wording->programLabel())
        ->toBe('ASSISTANCE TO INDIVIDUALS IN CRISIS SITUATIONS (AICS)');
});

it('uses the senior burial wording for current and legacy Gasan codes', function () {
    $provider = acknowledgementReceiptWordingProvider(
        require dirname(__DIR__, 3).'/config/action_center_acknowledgement_receipts.php',
    );

    foreach (['1704003000', '174003000'] as $municipalCode) {
        $wording = $provider->for($municipalCode, 'burial-assisstance-senior-citizen');

        expect($wording->resolvedAssistanceLabel('Senior Burial Assistance'))->toBe('Burial Assistance')
            ->and($wording->programLabel())
            ->toBe('ASSISTANCE TO SENIOR CITIZEN (Family of Deceased Senior Citizen)')
            ->and($wording->programLabel())->not->toContain('AICS');
    }
});

it('allows an assistance-type override to replace municipality wording', function () {
    $provider = acknowledgementReceiptWordingProvider([
        'defaults' => [
            'program_name' => 'DEFAULT PROGRAM',
            'program_acronym' => 'DEFAULT',
        ],
        'municipalities' => [
            '174003000' => [
                'program_name' => 'MUNICIPAL PROGRAM',
                'assistance_types' => [
                    'special-assistance' => [
                        'program_name' => 'SPECIAL PROGRAM',
                        'program_acronym' => null,
                    ],
                ],
            ],
        ],
    ]);

    expect($provider->for('174003000', 'special-assistance')->programLabel())
        ->toBe('SPECIAL PROGRAM');
});
