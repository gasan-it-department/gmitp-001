<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Auth\UseCase\LogoutUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __construct(
        private LogoutUser $logoutUser,
    ) {
    }

    public function __invoke(Request $request)
    {
        $this->logoutUser->execute();

        $redirect = '/';

        return response()->json([
            'message' => 'Successfully logged out',
            'redirect' => $redirect,
        ], 200);
    }
}
