<?php

namespace App\External\Web\Controllers\Auth;

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
}
