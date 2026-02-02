<?php

use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\CreateIntermentController;
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

                Route::get('/interments/create', CreateIntermentController::class)->name('index');

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