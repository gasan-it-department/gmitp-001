<?php
namespace App\Domains\Auth\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
class AuthenticatedSessionController extends Controller
{
    public function showLoginPage()
    {
        return Inertia::render('Auth/Login', [
        ]);
    }
}