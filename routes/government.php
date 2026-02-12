<?php

use App\Core\Government\UseCase\SearchOfficialsUseCase;
use App\External\Api\Controllers\Government\Official\SearchOfficialsController;
use App\External\Api\Controllers\Government\Terms\CreateTermController;
use App\External\Api\Controllers\Government\Terms\UpdateTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ListTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ShowTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ShowAppointOfficialController;

Route::prefix('{municipality}/government')
    ->name('government.admin.')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        //terms
        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

            Route::get('/', ListTermController::class)->name('page');

            Route::get('/{termId}', ShowTermController::class)->name('details');


        });
        //appoint official
        Route::prefix('official-terms')
            ->name('officials.terms.')
            ->group(function () {

            Route::get('/appoint-officials/{termId}', ShowAppointOfficialController::class)->name('page');

        });
        //official
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

                Route::put('update-terms/{termId}', UpdateTermController::class)->name('update');

            });

        Route::prefix('officials')
            ->name('officials.')
            ->group(function () {

                Route::post('/')->name('store');

                Route::get('/search-official', SearchOfficialsController::class)->name('search');

            });

    });