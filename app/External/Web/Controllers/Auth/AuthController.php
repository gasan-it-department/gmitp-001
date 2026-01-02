<?php

namespace App\External\Web\Controllers\Auth;

use App\Core\Auth\Services\OtpService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AuthController extends Controller
{

    public function showLoginPage()
    {
        return Inertia::render('Auth/Login');
    }

    public function showRegisterUserPage()
    {
        return Inertia::render('Auth/Register');
    }

    public function showOtpPage(OtpService $otpService)
    {
        $user = request()->user();

        $seconds = $otpService->getTimeRemaining($user->phone, OtpService::PURPOSE_REGISTER);

        return Inertia::render('Auth/OtpVerification', [

            'secondsRemaining' => $seconds,

            'phoneNumber' => $user->phone,

        ]);

    }
}
