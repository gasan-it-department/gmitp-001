<?php

use App\External\Web\Controllers\Auth\AuthController;
use App\External\Api\Controllers\Auth\CreateUserController;
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Auth\AuthenticateUserController;

Route::prefix('api/auth')
    ->middleware(['guest', 'municipalityContext'])
    ->group(function () {
        //api
        Route::post('/store-account', [CreateUserController::class, 'createUser'])->name('user.store');
        Route::post('/login', [AuthenticateUserController::class, 'login'])
            ->name('login')
            ->middleware('municipalityContext');

    });

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthenticateUserController::class, 'logout'])->name('logout');

});

