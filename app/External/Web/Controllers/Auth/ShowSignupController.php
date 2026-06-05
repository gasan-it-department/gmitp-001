<?php

namespace App\External\Web\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowSignupController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Auth/Signup/SignupPage');
    }
}