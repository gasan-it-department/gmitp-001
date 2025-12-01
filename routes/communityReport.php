<?php

use App\External\Api\Controllers\CommunityReport\CommunityReportController;
use App\External\Web\Controllers\CommunityReport\CommunityReportAdminController;

Route::prefix('/community-report')
    ->middleware(['municipalContext', 'admin'])
    ->name('communityReport')
    ->controller(CommunityReportAdminController::class)
    ->group(function () {

        Route::get('/', 'index')->name('page');

    });


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