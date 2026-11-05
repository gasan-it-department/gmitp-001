<?php

use App\External\Api\Controllers\Facility as Mutation;
use App\External\Web\Controllers\Facility\Admin;
use App\External\Web\Controllers\Facility\Client;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/facility')->middleware('municipalityContext')->name('facility.')->group(function () {
    Route::get('/', Client\IndexFacilityController::class)->name('index');
    Route::get('/{facility}', Client\ShowFacilityController::class)->whereUlid('facility')->name('show');
});

Route::prefix('{municipality}/admin/facility')->middleware(['municipalityContext', 'auth', 'admin', 'permission:facility.access'])
    ->name('facility.admin.')->group(function () {
        Route::get('/', Admin\IndexFacilityController::class)->middleware('permission:facility.view')->name('index');
        Route::get('/create', Admin\CreateFacilityController::class)->middleware('permission:facility.manage')->name('create');
        Route::get('/{facility}/edit', Admin\EditFacilityController::class)->whereUlid('facility')->middleware('permission:facility.manage')->name('edit');
        Route::get('/{facility}', Admin\ShowFacilityController::class)->whereUlid('facility')->middleware('permission:facility.view')->name('show');
    });

// Session/CSRF-protected Inertia form mutations, matching Event and Announcement.
// Context comes from X-Municipality-Slug, never from a submitted municipal_id.
Route::prefix('api/facility')->middleware(['municipalityContext', 'auth', 'admin', 'permission:facility.access'])
    ->name('api.facility.')->group(function () {
        Route::post('/', Mutation\StoreFacilityController::class)->middleware('permission:facility.manage')->name('store');
        Route::put('/{facility}', Mutation\UpdateFacilityController::class)->whereUlid('facility')->middleware('permission:facility.manage')->name('update');
        Route::put('/{facility}/weekly-hours', Mutation\ReplaceWeeklyHoursController::class)->whereUlid('facility')->middleware('permission:facility.manage')->name('weekly-hours');
        Route::post('/{facility}/exceptions', Mutation\StoreFacilityExceptionController::class)->whereUlid('facility')->middleware('permission:facility.manage')->name('exceptions.store');
        Route::put('/{facility}/exceptions/{exception}', Mutation\UpdateFacilityExceptionController::class)->whereUlid('facility')->whereUlid('exception')->middleware('permission:facility.manage')->name('exceptions.update');
        Route::delete('/{facility}/exceptions/{exception}', Mutation\DeleteFacilityExceptionController::class)->whereUlid('facility')->whereUlid('exception')->middleware('permission:facility.manage')->name('exceptions.destroy');
        Route::patch('/{facility}/operating-status', Mutation\SetFacilityOperatingStatusController::class)->whereUlid('facility')->middleware('permission:facility.manage')->name('operating-status');
        Route::patch('/{facility}/publish', Mutation\SetFacilityPublicationController::class)->whereUlid('facility')->middleware('permission:facility.publish')->name('publish');
        Route::delete('/{facility}', Mutation\DeleteFacilityController::class)->whereUlid('facility')->middleware('permission:facility.delete')->name('destroy');
    });
