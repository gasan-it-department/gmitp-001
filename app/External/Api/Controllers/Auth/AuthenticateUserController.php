<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Auth\Dto\LoginRequestDto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Auth\UseCase\LoginUser;
use App\External\Api\Request\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use App\Core\Auth\Exceptions\InvalidCredentialsExceptions;
use App\Core\Auth\Exceptions\InvalidPasswordException;
use Illuminate\Validation\ValidationException;
use App\Core\Auth\UseCase\LogoutUser;
use App\Core\Users\Services\UserRoleCheckerService;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;
class AuthenticateUserController extends Controller
{
    public function __construct(
        private LoginUser $loginUser,
        private LogoutUser $logoutUser,
        protected UserRoleCheckerService $userRoleCheckerService,
    ) {
    }

    public function login(LoginRequest $request)
    {
        try {

            $municipality = app('current_municipality');

            //convert the users input to dto to service
            $loginDto = new LoginRequestDto(
                $request->input('user_identifier'),
                $request->input('password'),
                $request->boolean('remember_me'),
            );
            //auth user

            $result = $this->loginUser->execute($loginDto, $municipality->slug);


            return response()->json(
                [
                    'success' => true,
                    'result' => $result,
                    // 'csrfToken' => csrf_token(),
                ],
                200
            );

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ]);
        } catch (InvalidCredentialsExceptions $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        } catch (InvalidPasswordException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function logout(Request $request)
    {
        $this->logoutUser->execute();

        $redirect = '/';
        return response()->json([
            'message' => 'Successfully logged out',
            'redirect' => $redirect,
        ], 200);

    }

}
