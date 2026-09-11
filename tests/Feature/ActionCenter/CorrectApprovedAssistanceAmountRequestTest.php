<?php

use App\External\Api\Request\ActionCenter\CorrectApprovedAssistanceAmountRequest;

it('accepts a confirmed amount correction with an administrative reason', function () {
    $request = CorrectApprovedAssistanceAmountRequest::create('/', 'POST', [
        'amount_approved' => '3500.50',
        'reason' => 'Corrected from the Mayor-authorized assistance record.',
        'confirm' => true,
    ]);

    $validator = validator($request->all(), $request->rules(), $request->messages());

    expect($validator->passes())->toBeTrue();
});

it('rejects invalid precision, a short reason, and missing confirmation', function () {
    $request = CorrectApprovedAssistanceAmountRequest::create('/', 'POST', [
        'amount_approved' => '3500.555',
        'reason' => 'Wrong',
        'confirm' => false,
    ]);

    $validator = validator($request->all(), $request->rules(), $request->messages());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('amount_approved'))->toBeTrue()
        ->and($validator->errors()->has('reason'))->toBeTrue()
        ->and($validator->errors()->has('confirm'))->toBeTrue();
});
