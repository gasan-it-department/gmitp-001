<?php

use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\IntermentsPageController;

Route::prefix('/{municipality}/cemetery')
    ->middleware(['auth', 'municipalityContext'])
    ->name('cemetery.')
    ->group(function () {

        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

                Route::get('/dashbord', [CemeteryController::class, 'index'])->name('dashboard');

                Route::get('/interments/index', [IntermentsPageController::class, 'index'])->name('index');

            });

    });