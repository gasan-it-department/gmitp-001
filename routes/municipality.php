<?php

use Illuminate\Support\Facades\Route;
use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use App\External\Api\Controllers\Municipality\MunicipalityController;

Route::prefix('municipality')
    ->as('municipality.')
    ->group(function () {

        // ========================
        // SUPER ADMIN ROUTES
        // ========================
        Route::middleware(['superAdmin'])
            ->prefix('super-admin')
            ->as('superAdmin.')
            ->group(function () {
            Route::get('/', [SuperAdminController::class, 'showMunicipalityPage'])
                ->name('page');

            Route::post('/add', [MunicipalityController::class, 'store'])
                ->name('add');

            Route::get('/list', [MunicipalityController::class, 'index'])
                ->name('index');

            Route::put('/update/{id}', [MunicipalityController::class, 'update'])
                ->name('update');
        });

        // ========================
        // PUBLIC MUNICIPAL ROUTES
        // ========================
    
        Route::get('/', [MunicipalityController::class, 'indexActiveMunicipalities'])
            ->name('index');

    });
