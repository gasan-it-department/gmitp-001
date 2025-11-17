<?php

use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\BulletinBoard\AnnouncementController;
use App\External\Api\Controllers\BulletinBoard\EventController;
use App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController;
use App\External\Web\Controllers\BulletinBoard\Admin\EventAdminController;

Route::prefix('{municipality}/bulletin-board')
    ->middleware('municipalityContext')
    ->as('bulletin-board.')
    ->group(function () {

        // PUBLIC ANNOUNCEMENTS
        Route::prefix('announcement')
            ->as('announcement.')
            ->controller(AnnouncementController::class)
            ->group(function () {
            Route::get('/', 'index')->name('page');
        });

        // ADMIN DASHBOARD (web page)
        Route::middleware('admin')
            ->prefix('announcement')
            ->as('announcement.admin.')
            ->controller(AnnouncementAdminController::class)
            ->group(function () {

            Route::get('/admin', 'index')->name('index');

        });

        // EVENTS (admin pages)
        Route::middleware('admin')
            ->prefix('events')
            ->as('events.admin.')
            ->controller(EventAdminController::class)
            ->group(function () {

            Route::get('/admin', 'index')->name('index');

        });
    });

//eg. https://api/announcement/
Route::prefix('api/announcement/')
    ->middleware(['municipalityContext'])
    ->as('announcement.')
    ->controller(AnnouncementController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth:sanctum'])
            ->group(function () {
                Route::get('/', 'fetch')->name('fetch');
                Route::post('/', 'store')->name('store');
                Route::put('/{id}', 'update')->name('update');
                Route::patch('/{id}/publish', 'publish')->name('publish');
                Route::delete('/{id}', 'destroy')->name('destroy');
            });

        Route::get('/published', 'getPublished')->name('fetchPublished');
    });

//eg. https://api/events/
Route::prefix('/api/events')
    ->middleware('municipalityContext')
    ->name('events.')
    ->controller(EventController::class)
    ->group(function () {

        Route::middleware(['auth:sanctum', 'admin'])
            ->group(function () {

                Route::get('/', 'fetch')->name("fetch");
                Route::post('/', 'store')->name("store");
                Route::put('/{id}', 'update')->name("update");
                Route::delete('/{id}', 'destroy')->name('destroy');

            });

        Route::get('/published', 'getPublished')->name('fetchPublish');

    });

