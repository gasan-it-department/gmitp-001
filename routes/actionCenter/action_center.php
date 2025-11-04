<?php
use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Api\Controllers\ActionCenter\ActionCenterController;
use App\External\Api\Controllers\ActionCenter\ActionCenterStatusController;
use App\External\Api\Controllers\ActionCenter\AssistanceTypeController;
use Illuminate\Support\Facades\Route;
Route::prefix('action-center')->group(function () {
    //shared 
    Route::resource('request', ActionCenterController::class)
        ->names([
            'index' => 'admin.action-center.requests.index',
            'store' => 'admin.action-center.requests.store',
            'show' => 'admin.action-center.requests.show',
            'update' => 'admin.action-center.requests.update',
            'destroy' => 'admin.action-center.requests.destroy',
        ]);

    Route::get('assistance-options', [AssistanceTypeController::class, 'assistanceTypesSelect'])
        ->name('assistance.options');


    // Admin
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->name('admin.')->group(function () {

        Route::get('/request-list', [AdminActionCenterController::class, 'showAdminActionCenterPage'])
            ->name('action.center.show');

        Route::get('status-list', [ActionCenterStatusController::class, 'getStatusList'])
            ->name('admin.action-center.requests.status');

        Route::post('/request/{assistanceId}/status', [ActionCenterStatusController::class, 'updateAssistanceStatus'])
            ->name('update.status');
    });

    // Client
    Route::prefix('client')->middleware(['auth:sanctum'])->name('client.')->group(function () {
    });
});

