<?php

use App\External\Api\Controllers\Government\Terms\CreateTermController;


Route::prefix('api/government')
    ->name('admin.government.')
    ->group(function () {

        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

                Route::post('store-terms', CreateTermController::class)->name('store');

            });

    });