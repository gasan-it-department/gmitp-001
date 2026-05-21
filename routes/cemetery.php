<?php

use App\External\Api\Controllers\Cemetery\Decedents\RegisterDecedentController;
use App\External\Api\Controllers\Cemetery\Interments\StoreIntermentController;
use App\External\Api\Controllers\Cemetery\Plots\StorePlotController;
use App\External\Web\Controllers\Cemetery\Admin\Decedents\ListDecedentsController;
use App\External\Web\Controllers\Cemetery\Admin\Decedents\RegisterDecedentsController;
use App\External\Web\Controllers\Cemetery\Admin\Decedents\ShowDecedentProfile;
use App\External\Web\Controllers\Cemetery\Admin\Interments\AssignDecedentToPlotController;
use App\External\Web\Controllers\Cemetery\Admin\Plots\CreatePlotController;
use App\External\Web\Controllers\Cemetery\Admin\Plots\ListPlotsController;
use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\Interements\CreateIntermentController;
use Illuminate\Support\Facades\Route;

/*
|---------------------------------------------------------------------------
| Cemetery — Inertia / Web routes
|---------------------------------------------------------------------------
| All page routes are scoped under /{municipality}/cemetery so the
| SetMunicipalityContext middleware can bind `municipal_id` into the
| container. Admin pages additionally require the `admin` middleware.
*/
Route::prefix('/{municipality}/cemetery')
    ->middleware(['auth', 'municipalityContext'])
    ->name('cemetery.')
    ->group(function () {

        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

                Route::get('/dashboard', [CemeteryController::class, 'index'])->name('dashboard');

                // Decedents
                Route::prefix('decedents')
                    ->name('decedents.')
                    ->group(function () {
                        Route::get('/', ListDecedentsController::class)->name('list.page');
                        Route::get('register', RegisterDecedentsController::class)->name('create.page');
                        Route::get('profile/{decedent_id}', ShowDecedentProfile::class)->name('profile.page');
                    });

                // Plots
                Route::prefix('/plots')
                    ->name('plots.')
                    ->group(function () {
                        Route::get('/', ListPlotsController::class)->name('list.page');
                        Route::get('/create', CreatePlotController::class)->name('create.page');
                    });

                // Interments
                Route::prefix('/interments')
                    ->name('interments.')
                    ->group(function () {
                        Route::get('/create', CreateIntermentController::class)->name('index');
                        Route::get('/assign/{decedent_id}', AssignDecedentToPlotController::class)->name('assign.page');
                    });
            });
    });

/*
|---------------------------------------------------------------------------
| Cemetery — API endpoints (Inertia form posts)
|---------------------------------------------------------------------------
| All write endpoints sit behind auth + admin + municipality scoping.
*/

Route::prefix('api/decedents')
    ->name('decedents.')
    ->middleware(['municipalityContext', 'admin', 'auth'])
    ->group(function () {
        Route::post('store', RegisterDecedentController::class)->name('store');
    });

Route::prefix('api/plots')
    ->name('plots.')
    ->middleware(['municipalityContext', 'admin', 'auth'])
    ->group(function () {
        Route::post('store', StorePlotController::class)->name('store');
    });

Route::prefix('api/interments')
    ->name('interments.')
    ->middleware(['municipalityContext', 'admin', 'auth'])
    ->group(function () {
        Route::post('store', StoreIntermentController::class)->name('store');
    });
