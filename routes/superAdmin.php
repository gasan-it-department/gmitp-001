<?php

use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;
use App\External\Web\Controllers\SuperAdmin\DashboardController;

Route::middleware(['web', 'superAdmin'])
    ->prefix('super-admin')
    ->as('super_admin.')
    ->group(function () {
        // Super Admin Dashboard
        Route::get('/dashboard', [SuperAdminController::class, 'showDashboard'])
            ->name('dashboard');

        Route::get('/create-user', [SuperAdminController::class, 'showCreateUsers'])
            ->name('create-user');

    });
