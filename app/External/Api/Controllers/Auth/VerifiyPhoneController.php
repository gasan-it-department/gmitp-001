<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Auth\Dto\VerifyPhoneDto;
use App\Core\Auth\Exceptions\InvalidOtpExceptions;
use App\Core\Auth\Services\OtpService;
use App\Core\Auth\UseCase\VerifyUserUseCase;
use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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

            $code = $this->otpService->resend($phone, 'sms');

            return response()->json(['message' => 'Code resent successfully']);

        } catch (Exception $e) {

            return response()->json(['message' => $e->getMessage()], 429);

        }

    }

}