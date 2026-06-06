<?php

use App\External\Api\Controllers\Event\Admin\DeleteEventController;
use App\External\Api\Controllers\Event\Admin\StoreEventController;
use App\External\Api\Controllers\Event\Admin\TogglePublishEventController;
use App\External\Api\Controllers\Event\Admin\UpdateEventController;
use App\External\Web\Controllers\Event\Admin\CreateEventController as AdminCreateEventController;
use App\External\Web\Controllers\Event\Admin\EditEventController as AdminEditEventController;
use App\External\Web\Controllers\Event\Admin\IndexEventController as AdminIndexEventController;
use App\External\Web\Controllers\Event\Admin\ShowEventController as AdminShowEventController;
use App\External\Web\Controllers\Event\Client\IndexEventController as ClientIndexEventController;
use App\External\Web\Controllers\Event\Client\ShowEventController as ClientShowEventController;
use Illuminate\Support\Facades\Route;

/*
 * Web (Inertia page rendering) — citizen-facing.
 */
Route::prefix('{municipality}/event')
    ->middleware(['municipalityContext'])
    ->name('event.')
    ->group(function () {
        Route::get('/', ClientIndexEventController::class)->name('index');
        Route::get('/{event}', ClientShowEventController::class)
            ->whereUlid('event')
            ->name('show');
    });

/*
 * Web (Inertia page rendering) — admin-facing.
 */
Route::prefix('{municipality}/admin/event')
    ->middleware(['municipalityContext', 'auth', 'admin'])
    ->name('event.admin.')
    ->group(function () {
        Route::get('/', AdminIndexEventController::class)->name('index');
        Route::get('/create', AdminCreateEventController::class)->name('create');
        Route::get('/{event}', AdminShowEventController::class)
            ->whereUlid('event')
            ->name('show');
        Route::get('/{event}/edit', AdminEditEventController::class)
            ->whereUlid('event')
            ->name('edit');
    });

/*
 * API (form mutations) — returns Inertia redirects, not JSON.
 */
Route::prefix('api/event')
    ->middleware(['municipalityContext', 'auth', 'admin'])
    ->name('api.event.')
    ->group(function () {
        Route::post('/', StoreEventController::class)->name('store');
        Route::put('/{event}', UpdateEventController::class)
            ->whereUlid('event')
            ->name('update');
        Route::patch('/{event}/publish', TogglePublishEventController::class)
            ->whereUlid('event')
            ->name('publish');
        Route::delete('/{event}', DeleteEventController::class)
            ->whereUlid('event')
            ->name('destroy');
    });
