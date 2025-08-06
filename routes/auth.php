<?php

use App\External\Web\Controllers\Auth\AuthController;
use App\External\Web\Controllers\Auth\CreateUserController;
use Illuminate\Support\Facades\Route;
use App\Auth\Controllers\RegisterUserController;
use App\Auth\Controllers\AuthenticatedSessionController;

//pages
Route::get('/register', [AuthController::class, 'showRegisterUserPage'])->name('register.show');
Route::get('/login', [AuthController::class, 'showLoginPage'])->name('login.show');

//api
Route::post('/store-account', [CreateUserController::class, 'createUser'])->name('user.store');
