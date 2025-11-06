<?php

use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Municipality\MunicipalityController;


Route::middleware(['web', 'superAdmin'])
    ->prefix('super-admin')
    ->as('super_admin.')
    ->group(function () {
        // Super Admin Dashboard
        Route::get('/dashboard', [SuperAdminController::class, 'showDashboard'])
            ->name('dashboard');

        Route::get('/create-user', [SuperAdminController::class, 'showCreateUsers'])
            ->name('create-user');

        Route::get('/municipality', [SuperAdminController::class, 'showMunicipalityPage'])
            ->name('municipality');

        Route::post('/municipality-add', [MunicipalityController::class, 'store'])
            ->name('municipality.add');

        Route::get('/municipalities-list', [MunicipalityController::class, 'index'])
            ->name('municipality.index');

        Route::put('/municipality-update/{id}', [MunicipalityController::class, 'update'])
            ->name('municipality.update');

    });
