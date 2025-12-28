<?php

namespace App\External\Api\Controllers\Auth;

use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\Request;
use App\Core\Auth\Services\OtpService;
use Illuminate\Validation\ValidationException;
use App\Core\Users\UseCases\GetUserByPhoneUseCase;
use App\Core\Auth\Exceptions\OtpThrottledException;
use Illuminate\Support\Facades\URL;

class ForgotPasswordController
{

    public function __construct(

        private OtpService $otpService,

        private GetUserByPhoneUseCase $getUserByPhoneUseCase,

    ) {
    }

    public function requestPassword(Request $request)
    {

        $validated = $request->validate([
            'phone' => [
                'required',
                'string',
                'regex:/^09\d{9}$/',
                'size:11'
            ],
        ]);

        $user = $this->getUserByPhoneUseCase->execute($validated['phone']);

        if (!$user) {

            throw ValidationException::withMessages([
                'phone' => 'This phone number is not registered in our system.',
            ]);
        }

        try {

            $this->otpService->generate(
                $user->phone,
                OtpService::PURPOSE_FORGOT_PASSWORD,
            );

            return redirect()->route('password.otp.verify', ['phone' => $validated['phone']])->with('success', 'A reset code has been sent to your phone.');

        } catch (OtpThrottledException $e) {

            throw ValidationException::withMessages([

                'phone' => $e->getMessage()

            ]);

        }

    }

    public function verifyForgetPasswordOtp(Request $request, PhoneFormatterService $phoneFormatter)
    {

        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $normalizedPhone = $phoneFormatter->normalize($validated['phone']);

        $isValid = $this->otpService->validate(
            $normalizedPhone,
            $validated['otp'],
            OtpService::PURPOSE_FORGOT_PASSWORD
        );

        if (!$isValid) {

            throw ValidationException::withMessages([
                'otp' => 'The code you entered is invalid or has expired.',
            ]);

        }

        $resetUrl = URL::temporarySignedRoute(
            'password.reset.form',
            now()->addMinutes(15),
            ['phone' => $normalizedPhone]
        );

        return redirect($resetUrl);

    }

}