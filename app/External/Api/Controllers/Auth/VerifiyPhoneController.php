<?php

namespace App\External\Api\Controllers\Auth;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Auth\Dto\VerifyPhoneDto;
use App\Core\Auth\Services\OtpService;
use App\Core\Auth\UseCase\VerifyUserUseCase;
use Illuminate\Validation\ValidationException;
use App\Core\Auth\Exceptions\InvalidOtpExceptions;
use App\Core\Auth\Exceptions\OtpThrottledException;

class VerifiyPhoneController extends Controller
{

    public function __construct(
        private OtpService $otpService,
        private VerifyUserUseCase $verifyUserUseCase
    ) {
    }

    public function verify(Request $request)
    {

        $validated = $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $currentUser = auth()->user();

        try {
            $dto = new VerifyPhoneDto(
                $currentUser->id,
                $currentUser->phone,
                $validated['otp'],
            );

            $this->verifyUserUseCase->execute($dto);

            return redirect()->intended(route('landing'));

        } catch (InvalidOtpExceptions $e) {

            return back()->withErrors([
                'otp' => $e->getMessage()
            ]);

        }

    }

    public function resendOtp()
    {

        $phone = request()->user()->phone;

        try {

            $this->otpService->resend($phone, OtpService::PURPOSE_REGISTER);

            return redirect()->back()->with('success', 'Code resent successfully');

        } catch (OtpThrottledException $e) {

            throw ValidationException::withMessages([
                'otp' => $e->getMessage(),
            ]);
        }

    }

}