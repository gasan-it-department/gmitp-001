<?php

use App\External\Web\Controllers\HomeBannerEditor\HomeBannerEditorController;

Route::prefix('{municipality}/home-banner-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('homeBanner.')
    ->controller(HomeBannerEditorController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });

