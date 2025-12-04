<?php

use App\External\Web\Controllers\PublicInformation\BiddingPageController;

Route::prefix('{municipality}/bidding-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('biddingAdminPage.')
    ->controller(BiddingPageController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });