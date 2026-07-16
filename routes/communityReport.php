<?php

use App\External\Api\Controllers\CommunityReport\Admin\AcknowledgeReportController;
use App\External\Api\Controllers\CommunityReport\Admin\ArchiveReportController;
use App\External\Api\Controllers\CommunityReport\Admin\RejectReportController;
use App\External\Api\Controllers\CommunityReport\Admin\ResolveReportController;
use App\External\Api\Controllers\CommunityReport\Admin\RestoreReportController;
use App\External\Api\Controllers\CommunityReport\Admin\StartReportProgressController;
use App\External\Api\Controllers\CommunityReport\StoreReportController;
use App\External\Web\Controllers\CommunityReport\Admin\IndexReportController as AdminIndexReportController;
use App\External\Web\Controllers\CommunityReport\Admin\ShowReportController as AdminShowReportController;
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
 * Web (Inertia page rendering) — admin-facing.
 */
Route::prefix('{municipality}/admin/community-reports')
    ->middleware(['municipalityContext', 'admin', 'permission:community_report.access'])
    ->name('communityReport.admin.')
    ->group(function () {

        Route::get('/', AdminIndexReportController::class)->name('index');
        Route::get('/{report_submission}', AdminShowReportController::class)
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

        // Admin Lifecycle Transitions
        Route::middleware(['admin', 'permission:community_report.access'])->group(function () {
            Route::post('/{report_submission}/acknowledge', AcknowledgeReportController::class)
                ->name('acknowledge');

            Route::post('/{report_submission}/start-progress', StartReportProgressController::class)
                ->name('start-progress');

            Route::post('/{report_submission}/resolve', ResolveReportController::class)
                ->name('resolve');

            Route::post('/{report_submission}/reject', RejectReportController::class)
                ->name('reject');

            Route::delete('/{report_submission}', ArchiveReportController::class)
                ->whereUlid('report_submission')
                ->name('archive');

            Route::post('/{report_submission}/restore', RestoreReportController::class)
                ->whereUlid('report_submission')
                ->name('restore');
        });

    });
