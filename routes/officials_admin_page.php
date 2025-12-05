<?php

use App\External\Web\Controllers\LocalGovernment\OfficialsController;

Route::prefix('{municipality}/officials-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('officialsEditor.')
    ->controller(OfficialsController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });