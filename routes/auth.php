<?php


use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Controllers\RegisterUserController;
use App\Domains\Auth\Controllers\AuthenticatedSessionController;

Route::get('/register', [RegisterUserController::class, 'showRegisterUserPage'])->name('register.show');
Route::get('/login', [AuthenticatedSessionController::class, 'showLoginPage'])->name('login.show');
Route::post('/store-account', [RegisterUserController::class, 'store']);
