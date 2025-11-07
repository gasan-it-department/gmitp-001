<?php
use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;

Route::middleware('superAdmin')
    ->prefix('super-admin')
    ->as('super.admin.')
    ->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'showDashboard'])
            ->name('dashboard');

        Route::get('/create-user', [SuperAdminController::class, 'showCreateUsers'])
            ->name('create-user');
    });
