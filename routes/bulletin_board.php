<?php

use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\BulletinBoard\AnnouncementController;
use App\External\Api\Controllers\BulletinBoard\EventController;
use App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController;
use App\External\Web\Controllers\BulletinBoard\Admin\EventAdminController;

Route::prefix('bulletin-board')
    ->as('bulletin-board.')
    ->group(function () {

        // PUBLIC ANNOUNCEMENTS
        Route::prefix('announcement')
            ->as('announcement.')
            ->controller(AnnouncementController::class)
            ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('{id}', 'show')->whereNumber('id')->name('show');
        });

        // ADMIN DASHBOARD (web page)
        Route::middleware('admin')
            ->prefix('announcement/admin')
            ->as('announcement.admin.')
            ->controller(AnnouncementAdminController::class)
            ->group(function () {
            Route::get('/', 'index')->name('index');
        });

        // ADMIN API ROUTES (data actions)
        Route::middleware('admin')
            ->prefix('announcement')
            ->as('announcement.')
            ->controller(AnnouncementController::class)
            ->group(function () {

            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::put('/{id}', 'update')->name('update');
            Route::patch('/{$id}/publish/', 'publish')->name('publish');
            Route::delete('/{id}', 'destroy')->name('destroy');
        });

        // EVENTS (admin pages)
        Route::middleware('admin')
            ->prefix('events/admin')
            ->as('events.admin.')
            ->controller(EventAdminController::class)
            ->group(function () {

            Route::get('/', 'index')->name('index');

        });

        Route::middleware('admin')
            ->prefix('events')
            ->as('events.')
            ->controller(EventController::class)
            ->group(function () {

                Route::post('/', 'store')->name('store');

            });
    });
