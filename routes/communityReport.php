<?php

use App\External\Api\Controllers\CommunityReport\StoreReportController;
use App\External\Web\Controllers\CommunityReport\Client\CreateReportController;
use Illuminate\Support\Facades\Route;

/*
 * Web (Inertia page rendering) — citizen-facing.
 */
Route::prefix('{municipality}/community-report')
    ->middleware(['municipalityContext', 'auth'])
    ->name('communityReport.')
    ->group(function () {

        Route::get('/create', CreateReportController::class)->name('create');

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
