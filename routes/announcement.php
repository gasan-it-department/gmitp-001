<?php

use App\External\Api\Controllers\Announcement\DeleteAnnouncementController;
use App\External\Api\Controllers\Announcement\StoreAnnouncementController;
use App\External\Api\Controllers\Announcement\TogglePublishAnnouncementController;
use App\External\Api\Controllers\Announcement\UpdateAnnouncementController;
use App\External\Web\Controllers\Announcement\Admin\CreateAnnouncementController as AdminCreateAnnouncementController;
use App\External\Web\Controllers\Announcement\Admin\EditAnnouncementController as AdminEditAnnouncementController;
use App\External\Web\Controllers\Announcement\Admin\IndexAnnouncementController as AdminIndexAnnouncementController;
use App\External\Web\Controllers\Announcement\Admin\ShowAnnouncementController as AdminShowAnnouncementController;
use App\External\Web\Controllers\Announcement\Client\IndexAnnouncementController as ClientIndexAnnouncementController;
use App\External\Web\Controllers\Announcement\Client\ShowAnnouncementController as ClientShowAnnouncementController;
use Illuminate\Support\Facades\Route;

/*
 * Web (Inertia page rendering) — citizen-facing.
 */
Route::prefix('{municipality}/announcement')
    ->middleware(['municipalityContext'])
    ->name('announcement.')
    ->group(function () {
        Route::get('/', ClientIndexAnnouncementController::class)->name('index');
        Route::get('/{announcement}', ClientShowAnnouncementController::class)
            ->whereUlid('announcement')
            ->name('show');
    });

/*
 * Web (Inertia page rendering) — admin-facing.
 */
Route::prefix('{municipality}/admin/announcement')
    ->middleware(['municipalityContext', 'auth', 'admin'])
    ->name('announcement.admin.')
    ->group(function () {
        Route::get('/', AdminIndexAnnouncementController::class)->name('index');
        Route::get('/create', AdminCreateAnnouncementController::class)->name('create');
        Route::get('/{announcement}', AdminShowAnnouncementController::class)
            ->whereUlid('announcement')
            ->name('show');
        Route::get('/{announcement}/edit', AdminEditAnnouncementController::class)
            ->whereUlid('announcement')
            ->name('edit');
    });

/*
 * API (form mutations) — returns Inertia redirects, not JSON.
 */
Route::prefix('api/announcement')
    ->middleware(['municipalityContext', 'auth', 'admin'])
    ->name('api.announcement.')
    ->group(function () {
        Route::post('/', StoreAnnouncementController::class)->name('store');
        Route::put('/{announcement}', UpdateAnnouncementController::class)
            ->whereUlid('announcement')
            ->name('update');
        Route::patch('/{announcement}/publish', TogglePublishAnnouncementController::class)
            ->whereUlid('announcement')
            ->name('publish');
        Route::delete('/{announcement}', DeleteAnnouncementController::class)
            ->whereUlid('announcement')
            ->name('destroy');
    });
