<?php

use App\External\Api\Controllers\CommunityReport\CommunityReportController;
use App\External\Api\Controllers\CommunityReport\CommunityReportTypeController;
use App\External\Web\Controllers\CommunityReport\CommunityReportAdminController;

Route::prefix('{municipality}/community-report')
    ->middleware(['municipalityContext', 'admin'])
    ->name('communityReport.')
    ->controller(CommunityReportAdminController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

        Route::get('/show/{id}', 'show')->name('show');

    });


Route::prefix('api/community-report')
    ->middleware(['municipalityContext', 'auth:sanctum'])
    ->name('communityReport')
    ->controller(CommunityReportController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth:sanctum', 'municipalityContext'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::patch('/resolve/{id}', 'resolve')->name('resolve');

                Route::patch('/reject/{id}', 'reject')->name('reject');

            });

        Route::post('/', 'store')->name('store');

        Route::get('/report-type', [CommunityReportTypeController::class, 'getCommunityReportType'])
            ->name('reportType');

    });