<?php

use App\External\Api\Controllers\CommunityReport\CommunityReportController;
use App\External\Web\Controllers\CommunityReport\CommunityReportAdminController;

Route::prefix('{municipality}/community-report')
    ->middleware(['municipalityContext', 'admin'])
    ->name('communityReport.')
    ->controller(CommunityReportAdminController::class)
    ->group(function () {

        Route::get('/', 'index')->name('page');

    });


Route::prefix('api/community-report')
    ->middleware(['municipalityContext'])
    ->name('communityReport')
    ->controller(CommunityReportController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth:sanctum', 'municipalityContext'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::get('/admin', 'show')->name('show');

            });

        Route::post('/', 'store')->name('store');

    });