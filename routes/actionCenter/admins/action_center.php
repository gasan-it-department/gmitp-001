<?php
use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Api\Controllers\ActionCenter\ActionCenterController;


Route::middleware(['admin', 'auth:sanctum'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/action-center', [AdminActionCenterController::class, 'showAdminActionCenterPage'])
            ->name('action.center.show');

        Route::resource('requests', ActionCenterController::class)
            ->names([
                'index' => 'admin.action-center.requests.index',
                'store' => 'admin.action-center.requests.store',
                'show' => 'admin.action-center.requests.show',
                'update' => 'admin.action-center.requests.update',
                'destroy' => 'admin.action-center.requests.destroy',
            ]);

    });

