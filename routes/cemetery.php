<?php

use App\External\Api\Controllers\Cemetery\Decedents\CreateReadinessOverrideController;
use App\External\Api\Controllers\Cemetery\Decedents\DeleteDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\DownloadDecedentCorrectionEvidenceController;
use App\External\Api\Controllers\Cemetery\Decedents\DownloadDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\RequestDecedentCorrectionController;
use App\External\Api\Controllers\Cemetery\Decedents\ReviewDecedentCorrectionController;
use App\External\Api\Controllers\Cemetery\Decedents\StoreDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\StoreDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\UpdateDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\VerifyDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\VerifyDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\ViewDecedentAvatarController;
use App\External\Api\Controllers\Cemetery\Interments\StoreIntermentController;
use App\External\Api\Controllers\Cemetery\Plots\StorePlotController;
use App\External\Web\Controllers\Cemetery\Admin\Interments\AssignDecedentToPlotController;
use App\External\Web\Controllers\Cemetery\Admin\Plots\CreatePlotController;
use App\External\Web\Controllers\Cemetery\Admin\Plots\ListPlotsController;
use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\Decedents\CreateDecedentController;
use App\External\Web\Controllers\Cemetery\Decedents\EditDecedentController;
use App\External\Web\Controllers\Cemetery\Decedents\IndexDecedentController;
use App\External\Web\Controllers\Cemetery\Decedents\ShowDecedentController;
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
            ->middleware(['admin', 'permission:cemetery.access'])
            ->name('admin.')
            ->group(function () {

                Route::get('/dashboard', [CemeteryController::class, 'index'])->name('dashboard');

                // Decedents
                Route::prefix('decedents')
                    ->name('decedents.')
                    ->group(function () {
                        Route::get('/', IndexDecedentController::class)->name('list.page');
                        Route::get('register', CreateDecedentController::class)->name('create.page');
                        Route::get('profile/{decedent_id}', ShowDecedentController::class)->name('profile.page');
                        Route::get('edit/{decedent_id}', EditDecedentController::class)->name('edit.page');
                        Route::get('{decedent_id}/avatar', ViewDecedentAvatarController::class)
                            ->middleware('permission:cemetery.decedents.documents.view')->name('avatar');
                        Route::get('{decedent_id}/documents/{document_id}', DownloadDecedentDocumentController::class)
                            ->middleware('permission:cemetery.decedents.documents.view')->name('documents.download');
                        Route::get('{decedent_id}/corrections/{correction_id}/evidence', DownloadDecedentCorrectionEvidenceController::class)
                            ->middleware('permission:cemetery.decedents.documents.view')->name('corrections.evidence');
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
                        Route::get('/create', CreateIntermentController::class)->middleware('permission:cemetery.decedents.manage')->name('index');
                        Route::get('/assign/{decedent_id}', AssignDecedentToPlotController::class)->middleware('permission:cemetery.decedents.manage')->name('assign.page');
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
    ->middleware(['municipalityContext', 'admin', 'auth', 'permission:cemetery.access'])
    ->group(function () {
        Route::post('store', StoreDecedentController::class)->middleware('permission:cemetery.decedents.manage')->name('store');
        Route::put('{decedent_id}', UpdateDecedentController::class)->middleware('permission:cemetery.decedents.manage')->name('update');
        Route::post('{decedent_id}/verify', VerifyDecedentController::class)->middleware('permission:cemetery.decedents.verify')->name('verify');
        Route::post('{decedent_id}/documents', StoreDecedentDocumentController::class)->middleware('permission:cemetery.decedents.manage')->name('documents.store');
        Route::post('{decedent_id}/documents/{document_id}/verify', VerifyDecedentDocumentController::class)
            ->middleware('permission:cemetery.decedents.verify')->name('documents.verify');
        Route::delete('{decedent_id}/documents/{document_id}', DeleteDecedentDocumentController::class)
            ->middleware('permission:cemetery.decedents.manage')->name('documents.delete');
        Route::post('{decedent_id}/corrections', RequestDecedentCorrectionController::class)
            ->middleware('permission:cemetery.decedents.correct')->name('corrections.store');
        Route::post('{decedent_id}/corrections/{correction_id}/review', ReviewDecedentCorrectionController::class)
            ->middleware('permission:cemetery.decedents.verify')->name('corrections.review');
        Route::post('{decedent_id}/readiness-overrides', CreateReadinessOverrideController::class)
            ->middleware('permission:cemetery.decedents.override')->name('readiness-overrides.store');
    });

Route::prefix('api/plots')
    ->name('plots.')
    ->middleware(['municipalityContext', 'admin', 'auth', 'permission:cemetery.access'])
    ->group(function () {
        Route::post('store', StorePlotController::class)->name('store');
    });

Route::prefix('api/interments')
    ->name('interments.')
    ->middleware(['municipalityContext', 'admin', 'auth', 'permission:cemetery.access'])
    ->group(function () {
        Route::post('store', StoreIntermentController::class)->middleware('permission:cemetery.decedents.manage')->name('store');
    });
