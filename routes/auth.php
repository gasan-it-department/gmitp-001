<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::get('/register', [RegisterUserController::class, 'showRegisterUserPage'])->name('register');
Route::get('/login', [AuthenticatedSessionController::class, 'showLoginPage'])->name('login');
Route::post('/store-account', [RegisterUserController::class, 'store']);
