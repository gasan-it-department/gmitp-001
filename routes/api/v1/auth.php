<?php

use App\External\Api\Controllers\V1\Auth\GoogleLoginController;
use App\External\Api\Controllers\V1\Auth\LogoutController;
use App\External\Api\Controllers\V1\Auth\SupabaseLoginController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/google', GoogleLoginController::class)
        ->middleware('throttle:10,1');

    Route::post('/supabase', SupabaseLoginController::class)
        ->middleware('throttle:10,1');

    Route::delete('/token', LogoutController::class)
        ->middleware('auth:sanctum');
});
