<?php

use App\External\Api\Controllers\V1\Auth\GoogleLoginController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/google', GoogleLoginController::class)
        ->middleware('throttle:10,1');

    Route::delete('/token', function () {
        request()->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Token revoked.',
        ]);
    })->middleware('auth:sanctum');
});