<?php

use App\External\Api\Controllers\CommunityReport\StoreReportController;
use App\External\Web\Controllers\CommunityReport\Client\CreateReportController;
use App\External\Web\Controllers\CommunityReport\Client\ListReportsController;
use App\External\Web\Controllers\CommunityReport\Client\ShowReportController;
use Illuminate\Support\Facades\Route;

/*
 * Web (Inertia page rendering) — citizen-facing.
 */
Route::prefix('{municipality}/community-report')
    ->middleware(['municipalityContext', 'auth'])
    ->name('communityReport.')
    ->group(function () {

        Route::get('/', ListReportsController::class)->name('index');
        Route::get('/create', CreateReportController::class)->name('create');
        Route::get('/{report_submission}', ShowReportController::class)
            ->whereUlid('report_submission')
            ->name('show');

    });

/*
 * API (form mutations) — returns Inertia redirects, not JSON.
 */
Route::prefix('api/community-report')
    ->middleware(['municipalityContext', 'auth'])
    ->name('api.communityReport.')
    ->group(function () {

        Route::post('/', StoreReportController::class)->name('store');

    });
