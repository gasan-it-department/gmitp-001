<?php

use App\External\Web\Controllers\Auth\AuthController;
use App\External\Api\Controllers\Auth\CreateUserController;
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Auth\AuthenticateUserController;

Route::middleware('guest')->group(function () {
    //pages
    Route::get('/register', [AuthController::class, 'showRegisterUserPage'])->name('register.show');
    Route::get('/login', [AuthController::class, 'showLoginPage'])->name('login.show');

    //api
    Route::post('/store-account', [CreateUserController::class, 'createUser'])->name('user.store');
    Route::post('/login', [AuthenticateUserController::class, 'login'])->name('login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticateUserController::class, 'logout'])->name('logout');
});

