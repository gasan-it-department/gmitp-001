<?php

use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;
use App\External\Web\Controllers\SuperAdmin\DashboardController;

Route::middleware(['web', 'superAdmin']) // ✅ applies web + super_admin middleware
    ->prefix('super-admin')              // ✅ URL prefix
    ->as('super_admin.')                 // ✅ route name prefix
    ->group(function () {
        // Super Admin Dashboard
        Route::get('/dashboard', [SuperAdminController::class, 'showDashboard'])
            ->name('dashboard');

        Route::get('/create-user', [SuperAdminController::class, 'showCreateUsers'])
            ->name('create-user');

    });
