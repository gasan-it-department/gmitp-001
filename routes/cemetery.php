<?php

use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\Interements\CreateIntermentController;
use App\External\Api\Controllers\Cemetery\Interments\RegisterIntermentsController;

Route::prefix('/{municipality}/cemetery')
    ->middleware(['auth', 'municipalityContext'])
    ->name('cemetery.')
    ->group(function () {

        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

                Route::get('/dashbord', [CemeteryController::class, 'index'])->name('dashboard');


                //interments page routings
                Route::prefix('/interments')
                    ->name('interments.')
                    ->group(function () {

                    Route::get('/create', CreateIntermentController::class)->name('index');

                });


                Route::prefix('/apartments')
                    ->name('apartments.')
                    ->group(function () {


                    });

                Route::prefix('/plots')
                    ->name('plots.')
                    ->group(function () {

                    });
            });

    });

Route::prefix('api/interments')
    ->name('interments.')
    ->group(function () {

        Route::middleware(['municipalityContext', 'admin', 'auth',])
            ->group(function () {

                Route::post('/store', RegisterIntermentsController::class)->name('store');

            });


    });