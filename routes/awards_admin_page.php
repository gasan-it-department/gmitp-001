<?php

use App\External\Web\Controllers\PublicInformation\AwardsPageController;

Route::prefix('{municipality}/awards-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('awardsAdminPage.')
    ->controller(AwardsPageController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });
