<?php

use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Api\Controllers\ActionCenter\ActionCenterController;
use App\External\Api\Controllers\ActionCenter\ActionCenterStatusController;
use App\External\Api\Controllers\ActionCenter\AssistanceTypeController;
use Illuminate\Support\Facades\Route;

Route::prefix('action-center')->group(function () {

    // Shared resource routes for assistance requests (admin only)
    Route::resource('request', ActionCenterController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy'])
        ->names([
            'index' => 'admin.action-center.requests.index',
            'store' => 'admin.action-center.requests.store',
            'show' => 'admin.action-center.requests.show',
            'update' => 'admin.action-center.requests.update',
            'destroy' => 'admin.action-center.requests.destroy',
        ])
        ->middleware(['auth:sanctum', 'admin']);

    // Delete route (explicitly using DELETE method)
    Route::delete('request/{request}', [ActionCenterController::class, 'destroy'])
        ->name('admin.action-center.requests.destroy')
        ->middleware(['auth:sanctum', 'admin']);

    // Assistance type options
    Route::get('assistance-options', [AssistanceTypeController::class, 'assistanceTypesSelect'])
        ->name('assistance.options');

    // Admin-specific routes
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->name('admin.')->group(function () {
        Route::get('/request-list', [AdminActionCenterController::class, 'showAdminActionCenterPage'])
            ->name('action.center.show');

        Route::get('status-list', [ActionCenterStatusController::class, 'getStatusList'])
            ->name('admin.action-center.requests.status');

        Route::post('/request/{assistanceId}/status', [ActionCenterStatusController::class, 'updateAssistanceStatus'])
            ->name('update.status');
    });

    // Client-specific routes
    Route::prefix('client')->middleware(['auth:sanctum'])->name('client.')->group(function () {
        // Add client-specific routes here
    });
});
