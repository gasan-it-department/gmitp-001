<?php

use App\External\Api\Controllers\CitizenReport\CitizenReportController;


Route::prefix('api/citizen-report')
    ->middleware(['municipalityContext'])
    ->name('citizenReport')
    ->controller(CitizenReportController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth:sanctum'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::get('/', 'show')->name('show');

            });

        Route::post('/', 'store')->name('store');

    });