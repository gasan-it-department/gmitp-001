<?php

use App\External\Api\Controllers\CommunityReport\CommunityReportController;


Route::prefix('api/community-report')
    ->middleware(['municipalityContext'])
    ->name('communityReport')
    ->controller(CommunityReportController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth:sanctum'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::get('/', 'show')->name('show');

            });

        Route::post('/', 'store')->name('store');

    });