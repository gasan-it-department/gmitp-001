<?php

namespace App\External\Web\Controllers\Auth;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Core\Auth\Services\OtpService;
use App\Core\Users\UseCases\GetUserByPhoneUseCase;

class ForgotPasswordViewController
{

    public function __construct(

        private GetUserByPhoneUseCase $getUserByPhoneUseCase

    ) {
    }

    public function index()
    {

        return Inertia::render('Auth/ForgotPassword/ForgotPassword');

    }

    public function showOtpForm(Request $request, OtpService $otpService)
    {
        $rawPhone = $request->query('phone');

        if (!$rawPhone) {
            return redirect()->route('password.request');
        }

        try {
            $user = $this->getUserByPhoneUseCase->execute($rawPhone);

            if (!$user) {
                throw new \Exception("User not found");
            }

            $secondsRemaining = $otpService->getTimeRemaining($user->phone, OtpService::PURPOSE_FORGOT_PASSWORD);

            return Inertia::render('Auth/ForgotPassword/VerifyResetPasswordOtp', [
                'phone' => $rawPhone,
                'initialSecondsRemaining' => $secondsRemaining,
            ]);

        } catch (\Exception $e) {

            return redirect()->route('password.request')
                ->withErrors(['phone' => 'Invalid or missing account details.']);
        }
    }

    public function showResetForm(Request $request, string $phone)
    {

        return Inertia::render('Auth/ForgotPassword/ResetPassword', [
            'phone' => $phone
        ]);

    }

}