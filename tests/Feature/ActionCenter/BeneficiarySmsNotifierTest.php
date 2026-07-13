<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Services\BeneficiarySmsNotifier;
use App\Shared\Sms\Contracts\SmsProviderInterface;

function actionCenterSmsBeneficiary(?string $phone = '639171234567'): Beneficiary
{
    $beneficiary = new Beneficiary([
        'municipal_id' => '01J00000000000000000000000',
        'beneficiary_number' => 'GAS-000001',
        'contact_phone' => $phone,
    ]);

    $beneficiary->id = '01J00000000000000000000001';

    return $beneficiary;
}

it('sends the beneficiary profile lifecycle messages', function (string $method, string $expectedText) {
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')
        ->once()
        ->with(
            '639171234567',
            Mockery::on(fn (string $message): bool => str_contains($message, $expectedText)
                && str_contains($message, 'GAS-000001')),
        )
        ->andReturn(['message_id' => 1]);

    (new BeneficiarySmsNotifier($provider))->{$method}(actionCenterSmsBeneficiary());
})->with([
    'received' => ['profileReceived', 'Natanggap na namin'],
    'verified' => ['profileVerified', 'Verified na'],
    'rejected' => ['profileRejected', 'Hindi na-verify'],
]);

it('does not call the SMS provider when the beneficiary has no contact phone', function () {
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldNotReceive('send');

    (new BeneficiarySmsNotifier($provider))->profileReceived(actionCenterSmsBeneficiary(null));
});

it('does not fail a completed workflow when the SMS provider throws', function () {
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')
        ->once()
        ->andThrow(new RuntimeException('Provider unavailable'));

    (new BeneficiarySmsNotifier($provider))->profileVerified(actionCenterSmsBeneficiary());

    expect(true)->toBeTrue();
});
