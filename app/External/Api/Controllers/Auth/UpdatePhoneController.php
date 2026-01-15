<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Auth\Services\OtpService;
use App\Core\Users\UseCases\UpdatePhoneNumberUseCase;
use App\Http\Controllers\Controller;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\Request;

class UpdatePhoneController extends Controller
{

    public function __construct(

        private PhoneFormatterService $phoneFormatterService,

        private UpdatePhoneNumberUseCase $updatePhoneNumberUseCase,

        private OtpService $otpService,

    ) {
    }

    public function update(Request $request)
    {
        $userId = auth()->id(); // Helper is cleaner

        $validatedData = $request->validate([
            'phone' => [
                'required',
                'string',
                'min:11',
                'max:13'
            ],
        ]);

        $rawPhone = $validatedData['phone'];

        $normalizedPhone = $this->phoneFormatterService->normalize($rawPhone);

        $this->updatePhoneNumberUseCase->execute($userId, $normalizedPhone);

        $this->otpService->generate($normalizedPhone, OtpService::PURPOSE_REGISTER, 'sms');

        return back();
    }

}