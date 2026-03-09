<?php

use App\External\Api\Controllers\Government\Official\SearchOfficialsController;
use App\External\Api\Controllers\Government\Official\StoreOfficialController;
use App\External\Api\Controllers\Government\Official\UpdateOfficialProfileController;
use App\External\Api\Controllers\Government\Official\UpdateOfficialProfilePictureController;
use App\External\Api\Controllers\Government\OfficialTerms\AppointOfficialController;
use App\External\Api\Controllers\Government\OfficialTerms\ConcludeOfficialTermController;
use App\External\Api\Controllers\Government\OfficialTerms\RemoveOfficialAppointmentController;
use App\External\Api\Controllers\Government\OfficialTerms\UpdateActiveAppointmentController;
use App\External\Api\Controllers\Government\OfficialTerms\UpdateHistoricalAppointmentController;
use App\External\Api\Controllers\Government\Terms\CreateTermController;
use App\External\Api\Controllers\Government\Terms\ToggleTermPublishController;
use App\External\Api\Controllers\Government\Terms\UpdateTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ListOfficialsController;
use App\External\Web\Controllers\LocalGovernment\Admin\ListTermController;
use App\External\Web\Controllers\LocalGovernment\Admin\ShowAppointOfficialController;
use App\External\Web\Controllers\LocalGovernment\Admin\ShowOfficialProfileController;
use App\External\Web\Controllers\LocalGovernment\Admin\ShowTermController;
use App\External\Web\Controllers\LocalGovernment\Public\ShowOfficialsRosterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//public view of the government terms roster
Route::prefix('{municipality}/government')
    ->name('government.')
    ->middleware(['municipalityContext'])
    ->group(function () {

        Route::get('roster/{term_slug?}', ShowOfficialsRosterController::class)->name('roster');

    });



Route::prefix('{municipality}/government')
    ->name('government.admin.')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        //terms
        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

            Route::get('/', ListTermController::class)->name('page');

            Route::get('/{termId}', ShowTermController::class)->name('details');


        });
        //appoint official
        Route::prefix('official-terms')
            ->name('officials.terms.')
            ->group(function () {

            Route::get('/appoint-officials/{termId}', ShowAppointOfficialController::class)->name('page');

        });
        //official
        Route::prefix('officials')
            ->name('officials.')
            ->group(function () {

            Route::get('/', ListOfficialsController::class)->name('page');
            Route::get('profile/{officialId}', ShowOfficialProfileController::class)->name('profile');

        });



    });


Route::prefix('api/government')
    ->name('government.admin.')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        Route::prefix('terms')
            ->name('terms.')
            ->group(function () {

                Route::post('store-terms', CreateTermController::class)->name('store');

                Route::put('update-terms/{termId}', UpdateTermController::class)->name('update');

                Route::patch('toggle-publish-term/{id}', ToggleTermPublishController::class)->name('toggle.publish');

            });

        Route::prefix('officials')
            ->name('officials.')
            ->group(function () {

                Route::post('/', StoreOfficialController::class)->name('store');

                Route::get('/search-official', SearchOfficialsController::class)->name('search');

                Route::post('appoint-official', AppointOfficialController::class)->name('appoint');

                Route::delete('delete/appointed-official/{id}', RemoveOfficialAppointmentController::class)->name('delete');

                Route::put('conclude-official/{id}', ConcludeOfficialTermController::class)->name('conclude');

                Route::put('update-appointment-history/{id}', UpdateHistoricalAppointmentController::class)->name('update.history');

                Route::patch('update-active-appointment/{id}', UpdateActiveAppointmentController::class)->name('update.active.appointment');

                Route::put('update-profile-picture/{officialId}', UpdateOfficialProfilePictureController::class)->name('update.profile');

                Route::put('update/{officialId}/official', UpdateOfficialProfileController::class)->name('update.official');
            });

    });