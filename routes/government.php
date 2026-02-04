<?php

use App\External\Api\Controllers\Government\Terms\CreateTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ListTermController;

Route::prefix('{municipality}/government')
    ->name('government.admin.')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

                Route::get('/', ListTermController::class)->name('page');

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

    });