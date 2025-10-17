<?php

use App\External\Web\Controllers\Admin\AdminDasboardController;

Route::middleware(['admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [AdminDasboardController::class, 'showAdminDashboard'])
            ->name('dashboard.show');

    });
