<?php

use App\External\Api\Controllers\Government\Terms\CreateTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ListTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ShowAppointOfficialController;

Route::prefix('{municipality}/government')
    ->name('government.admin.')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

                Route::get('/', ListTermController::class)->name('page');

            });

        Route::prefix('official-terms')
            ->name('officials.terms')
            ->group(function () {

                Route::get('/{termId}', ShowAppointOfficialController::class)->name('page');

            });

        Route::prefix('officials')
            ->name('officials.')
            ->group(function () {

                // Route::get('/', )->name('page');
        
            });



    });


Route::prefix('api/government')
    ->name('government.admin.')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

                Route::post('store-terms', CreateTermController::class)->name('store');

            });

        Route::prefix('officials')
            ->name('officials.')
            ->group(function () {

                Route::post('/')->name('store');

            });

    });