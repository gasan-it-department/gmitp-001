<?php

use App\External\Api\Controllers\Municipality\Logo\SetMunicipalityLogoController;
use App\External\Api\Controllers\Municipality\Logo\UpdateMunicipalityLogoController;
use App\External\Api\Controllers\Municipality\MunicipalityController;
use App\External\Api\Controllers\Municipality\MunicipalitySettingsController;
use App\External\Web\Controllers\Municipality\MunicipalityAdminController;
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


//showing the pages for the municipality
Route::prefix('{municipality}/municipality-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('municipality.admin.')
    ->controller(MunicipalityAdminController::class)
    ->group(function () {

        Route::get('/', 'index')->name('page');

    });

//api for municipality settings
Route::prefix('api/municipality')
    ->middleware(['municipalityContext', 'admin'])
    ->name('municipality.admin.')
    ->controller(MunicipalitySettingsController::class)
    ->group(function () {

        //for logo create and update route
        Route::post('/store-logo', SetMunicipalityLogoController::class)->name('store.logo');
        Route::post('/update-logo', UpdateMunicipalityLogoController::class)->name('update.logo');
        //
    
        Route::post('/', 'store')->name('setSettings');

        Route::patch('/update/{id}', 'updateSettings')->name('updateSettings');

        Route::post('/save-banner', 'storeBanner')->name('saveBanner');

        Route::delete('/delete-banner/{id}', 'destroyBanner')->name('deleteBanner');

    });




