<?php

use App\External\Web\Controllers\PublicInformation\CitizenCharterController;

Route::prefix('{municipality}/citizen-charter-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('citizenCharter.')
    ->controller(CitizenCharterController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });