<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Auth\Application\Dto\LoginRequestDto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Auth\Domain\Policies\AccountLockoutPolicy;
use App\Core\Auth\Application\Services\{LoginUser, LogoutUser, RememberUser};
use App\Core\Auth\Domain\Entities\LoginUserRequest;
use App\External\Api\Request\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class AuthenticateUserController extends Controller
{
    public function __construct(
        private LoginUser $loginUser,
    ) {
    }

    public function loginLaravel(LoginRequest $request)
    {
        $validated = $request->validated();
        if (Auth::attempt($validated)) {
            $request->session()->regenerate();

            return redirect()->route('home.show')->with([
                'message' => 'login successful',
            ]);
        }
        return redirect()->back()->with([
            'message' => 'invalid credentials'
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        //convert the users input to dto to service
        $loginDto = new LoginRequestDto(
            $request->input('user_name'),
            $request->input('password'),
            $request->boolean('remember_me'),
            $request->ip(),
            $request->userAgent()
        );

        //auth user
        $result = $this->loginUser->execute($loginDto);
        if (!$result->success) {
            return response()->json($result->toArray());
        }

        return response()->json($result->toArray(), 401);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        $success = $this->logoutUseCase->execute($token);

        return response()->json(['success' => $success]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        $authResponse = $this->rememberUseCase->execute($token);

        if (!$authResponse) {
            return response()->json(['error' => 'Invalid or expired token'], 401);
        }

        return response()->json(['auth' => $authResponse->toArray()]);
    }
}
