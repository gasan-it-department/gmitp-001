<?php

use App\Core\ActionCenter\Services\ConfiguredFinancialDocumentDefaultsProvider;
use Illuminate\Config\Repository;

function financialDocumentDefaultsProvider(array $config): ConfiguredFinancialDocumentDefaultsProvider
{
    return new ConfiguredFinancialDocumentDefaultsProvider(new Repository([
        'action_center_financial_documents' => $config,
    ]));
}

it('returns safe blank defaults for an unknown municipality', function () {
    $provider = financialDocumentDefaultsProvider([
        'defaults' => [
            'obligation_request' => ['number_prefix' => '', 'responsibility_center' => ''],
            'disbursement_voucher' => ['responsibility_center_code' => ''],
            'certificate_of_eligibility' => ['certified_by_position' => ''],
        ],
        'municipalities' => [],
    ]);

    $defaults = $provider->for('UNKNOWN');

    expect($defaults->obligationRequestNumberPrefix)->toBe('')
        ->and($defaults->obligationRequestResponsibilityCenter)->toBe('')
        ->and($defaults->disbursementVoucherResponsibilityCenterCode)->toBe('')
        ->and($defaults->certificateOfEligibilityCertifiedByPosition)->toBe('');
});

it('returns the configured Gasan recommendations', function () {
    $provider = financialDocumentDefaultsProvider(
        require dirname(__DIR__, 3).'/config/action_center_financial_documents.php',
    );

    $defaults = $provider->for('174003000', 'medical-assistance');

    expect($defaults->obligationRequestNumberPrefix)->toBe('200-2026-08-')
        ->and($defaults->obligationRequestResponsibilityCenter)->toBe('7611')
        ->and($defaults->obligationRequestAccountCode)->toBe('5-02-99-080')
        ->and($defaults->disbursementVoucherResponsibilityCenterCode)->toBe('7611')
        ->and($defaults->certificateOfEligibilityCertifiedByPosition)->toBe('Social Welfare Officer III');
});

it('gives assistance-type overrides precedence over municipality values', function () {
    $provider = financialDocumentDefaultsProvider([
        'defaults' => [
            'obligation_request' => ['account_code' => 'DEFAULT'],
        ],
        'municipalities' => [
            '174003000' => [
                'obligation_request' => ['account_code' => 'MUNICIPAL'],
                'assistance_types' => [
                    'medical-assistance' => [
                        'obligation_request' => ['account_code' => 'MEDICAL'],
                    ],
                ],
            ],
        ],
    ]);

    expect($provider->for('174003000', 'medical-assistance')->obligationRequestAccountCode)
        ->toBe('MEDICAL')
        ->and($provider->for('174003000', 'burial-assistance')->obligationRequestAccountCode)
        ->toBe('MUNICIPAL');
});
