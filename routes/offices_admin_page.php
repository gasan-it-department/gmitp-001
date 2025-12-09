<?php

use App\External\Web\Controllers\LocalGovernment\OfficesAdminController;

Route::prefix('{municipality}/offices-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('officesAdmin.')
    ->controller(OfficesAdminController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });