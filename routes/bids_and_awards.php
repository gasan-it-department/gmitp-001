<?php

use App\External\Web\Controllers\PublicInformation\PublicInformationController;

Route::prefix('{municipality}/bids-and-awards')
    ->middleware(['municipalityContext', 'admin'])
    ->name('bidsAndAwards.')
    ->controller(PublicInformationController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });

