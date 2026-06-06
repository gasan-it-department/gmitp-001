<?php

use App\External\Api\Controllers\Municipality\DeleteHotlineController;
use App\External\Api\Controllers\Municipality\MunicipalityController;
use App\External\Api\Controllers\Municipality\StoreHotlineController;
use App\External\Api\Controllers\Municipality\StoreMunicipalityController;
use App\External\Api\Controllers\Municipality\UpdateHotlineController;
use App\External\Api\Controllers\Municipality\UpdateMunicipalityController;
use App\External\Api\Controllers\Municipality\UpdateSettingsController;
use App\External\Api\Controllers\Psgc\LocationController;
use App\External\Web\Controllers\Municipality\Admin\EditMunicipalitySettingsController;
use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;

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

            Route::post('/add', StoreMunicipalityController::class)
                ->name('add');

            Route::put('/update/{id}', UpdateMunicipalityController::class)
                ->name('update');
        });

        // ========================
        // PUBLIC MUNICIPAL ROUTES
        // ========================

        Route::get('/', [MunicipalityController::class, 'indexActiveMunicipalities'])
            ->name('index');

    });


/*
 * Admin web (Inertia render) — unified Settings & Hotlines management page.
 */
Route::prefix('{municipality}/admin/municipality')
    ->middleware(['municipalityContext', 'admin', 'permission:municipality_settings.access'])
    ->name('municipality.admin.')
    ->group(function () {
        Route::get('/settings', EditMunicipalitySettingsController::class)
            ->name('settings.edit');
    });

/*
 * Admin API (form mutations) — returns Inertia redirects, not JSON.
 */
Route::prefix('api/municipality')
    ->middleware(['municipalityContext', 'admin', 'permission:municipality_settings.access'])
    ->name('api.municipality.')
    ->group(function () {
        Route::put('/settings', UpdateSettingsController::class)
            ->name('settings.update');

        Route::post('/hotlines', StoreHotlineController::class)
            ->name('hotlines.store');

        Route::put('/hotlines/{hotline}', UpdateHotlineController::class)
            ->whereUlid('hotline')
            ->name('hotlines.update');

        Route::delete('/hotlines/{hotline}', DeleteHotlineController::class)
            ->whereUlid('hotline')
            ->name('hotlines.destroy');
    });

//api for address or location
Route::prefix('api/gmitp-001-psgc')
    ->name('psgc.')
    ->controller(LocationController::class)
    ->group(function () {

        Route::get('regions', 'regions')->name('regions');
        Route::get('provinces/{id}', 'provinces')->name('provinces');
        Route::get('municipalities/{id}', 'municipalities')->name('municipalities');
        Route::get('cities/{id}', 'municipalitiesByRegion')->name('cities');
        Route::get('barangays/{id}', 'barangays')->name('barangays');

    });
