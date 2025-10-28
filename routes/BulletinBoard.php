<?php

use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\BulletinBoard\AnnouncementController;
use App\External\Api\Controllers\BulletinBoard\EventController;

Route::prefix('bulletin-board')
    ->as('bulletin-board.')
    ->group(function () {

        Route::prefix('announcement')
            ->as('announcement.')
            ->group(function () {
                Route::get('/', [AnnouncementController::class, 'index'])->name('index');
                Route::post('/', [AnnouncementController::class, 'store'])->name('store');
                Route::get('{id}', [AnnouncementController::class, 'show'])->name('show');
                Route::put('{id}', [AnnouncementController::class, 'update'])->name('update');
                Route::delete('{id}', [AnnouncementController::class, 'destroy'])->name('destroy');
            });

        Route::prefix('events')
            ->as('events.')
            ->controller(EventController::class)
            ->group(function () {
                Route::post('/', 'store')->name('store');
            });

    });
