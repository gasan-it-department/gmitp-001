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

        // ANNOUNCEMENTS (admin pages)
        Route::middleware(['auth', 'admin', 'permission:bulletin_board.access'])
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

        Route::middleware(['admin', 'auth'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::post('/', 'store')->name('store');

                Route::put('/{id}', 'update')->name('update');

                Route::patch('/{id}/publish', 'publish')->name('publish');

                Route::delete('/{id}', 'destroy')->name('destroy');

                Route::post('/delete/multiple', 'destroyMultiple')->name('destroyMultiple');
            });

        Route::get('/published', 'getPublished')->name('fetchPublished');
    });

//eg. https://api/events/
Route::prefix('/api/events')
    ->name('events.')
    ->controller(EventController::class)
    ->group(function () {

        Route::middleware(['auth', 'admin'])
            ->group(function () {

                Route::get('/', 'fetch')->name("fetch")->middleware('municipalityContext');

                Route::post('/', 'store')->name("store")->middleware('municipalityContext');

                Route::put('/{id}', 'update')->name("update")->middleware('municipalityContext');

                Route::post('/delete', 'destroy')->name('destroy')->middleware('municipalityContext');

            });

        Route::get('/published', 'getPublished')->name('fetchPublish')->middleware('municipalityContext');

    });

