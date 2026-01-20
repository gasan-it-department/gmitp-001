<?php

use App\External\Api\Controllers\CommunityReport\CommunityReportController;
use App\External\Api\Controllers\CommunityReport\CommunityReportTypeController;
use App\External\Web\Controllers\CommunityReport\CommunityReportAdminController;
use App\External\Web\Controllers\CommunityReport\Client\CommunityReportClientController;

Route::prefix('{municipality}/community-report')
    ->middleware(['municipalityContext', 'admin'])
    ->name('communityReport.')
    ->controller(CommunityReportAdminController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

        Route::get('/show/{id}', 'show')->name('show');

    });


Route::prefix('api/community-report')
    ->middleware(['municipalityContext', 'auth'])
    ->name('communityReport')
    ->controller(CommunityReportController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth', 'municipalityContext'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::patch('/resolve/{id}', 'resolve')->name('resolve');

                Route::patch('/reject/{id}', 'reject')->name('reject');

            });

        Route::post('/', 'store')->name('store');

        Route::get('/report-type', [CommunityReportTypeController::class, 'getCommunityReportType'])
            ->name('reportType');

    });

Route::prefix('{municipality}/community-report')
    ->middleware(['municipalityContext', 'auth'])
    ->name('communityReport.')
    ->controller(CommunityReportClientController::class)
    ->group(function () {

        Route::get('/client', 'index')->name('client.page');

        Route::get('/show/{id}', 'show')->name('show');

    });