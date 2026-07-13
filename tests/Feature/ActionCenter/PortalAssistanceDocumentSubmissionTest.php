<?php

use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

it('allows portal preregistration without supporting document uploads', function () {
    $request = new StoreAssistanceRequest;

    $validator = Validator::make([
        'description' => 'Medical assistance is needed for ongoing treatment.',
        'privacy_consent' => true,
    ], $request->rules(), $request->messages());

    expect($validator->passes())->toBeTrue();
});

it('allows an on-behalf portal preregistration without recipient id uploads', function () {
    $request = new StoreAssistanceRequest;

    $validator = Validator::make([
        'description' => 'Medical assistance is needed for an adult family member.',
        'privacy_consent' => true,
        'relationship_to_beneficiary' => 'parent',
        'on_behalf_first_name' => 'Pedro',
        'on_behalf_last_name' => 'Santos',
    ], $request->rules(), $request->messages());

    expect($validator->passes())->toBeTrue();
});

it('rejects supporting documents posted to the citizen endpoint', function () {
    $request = new StoreAssistanceRequest;

    $validator = Validator::make([
        'description' => 'Medical assistance is needed for ongoing treatment.',
        'privacy_consent' => true,
        'documents' => [
            'valid_id_front' => UploadedFile::fake()->create('valid-id-front.pdf', 50, 'application/pdf'),
        ],
    ], $request->rules(), $request->messages());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->first('documents'))
        ->toBe('Supporting documents are recorded by MSWD after the physical originals are inspected.');
});
