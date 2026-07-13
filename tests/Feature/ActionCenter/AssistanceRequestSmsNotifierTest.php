<?php

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Shared\Sms\Contracts\SmsProviderInterface;

function actionCenterSmsRequest(?string $phone = '639171234567'): AssistanceRequest
{
    $beneficiary = new Beneficiary([
        'municipal_id' => '01J00000000000000000000000',
        'contact_phone' => $phone,
    ]);
    $beneficiary->id = '01J00000000000000000000001';

    $request = new AssistanceRequest([
        'municipal_id' => '01J00000000000000000000000',
        'beneficiary_id' => $beneficiary->id,
        'transaction_number' => '#REQ-2026-0001',
    ]);
    $request->id = '01J00000000000000000000002';
    $request->setRelation('beneficiary', $beneficiary);

    return $request;
}

it('sends the assistance request lifecycle messages', function (string $method, string $expectedText) {
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')
        ->once()
        ->with(
            '639171234567',
            Mockery::on(fn (string $message): bool => str_contains($message, $expectedText)
                && str_contains($message, '#REQ-2026-0001')),
        )
        ->andReturn(['message_id' => 1]);

    (new AssistanceRequestSmsNotifier($provider))->{$method}(actionCenterSmsRequest());
})->with([
    'received' => ['requestReceived', 'Natanggap ang request'],
    'under review' => ['reviewStarted', 'Sinusuri na'],
    'approved' => ['requestApproved', 'Naaprubahan'],
    'rejected' => ['requestRejected', 'Hindi naaprubahan'],
    'released' => ['requestReleased', 'Naitala nang released'],
]);

it('does not call the SMS provider when the beneficiary has no contact phone', function () {
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldNotReceive('send');

    (new AssistanceRequestSmsNotifier($provider))->requestReceived(actionCenterSmsRequest(null));
});

it('does not fail a completed request transition when the SMS provider throws', function () {
    $provider = Mockery::mock(SmsProviderInterface::class);
    $provider->shouldReceive('send')
        ->once()
        ->andThrow(new RuntimeException('Provider unavailable'));

    (new AssistanceRequestSmsNotifier($provider))->requestApproved(actionCenterSmsRequest());

    expect(true)->toBeTrue();
});
