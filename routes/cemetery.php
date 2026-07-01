<?php

use App\External\Api\Controllers\Cemetery\Blocks\StoreCemeteryBlockController;
use App\External\Api\Controllers\Cemetery\Decedents\CorrectDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\CreateReadinessOverrideController;
use App\External\Api\Controllers\Cemetery\Decedents\DeleteDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\DeleteDraftDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\DownloadDecedentCorrectionEvidenceController;
use App\External\Api\Controllers\Cemetery\Decedents\DownloadDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\StoreDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\StoreDecedentDocumentController;
use App\External\Api\Controllers\Cemetery\Decedents\UpdateDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\VerifyDecedentController;
use App\External\Api\Controllers\Cemetery\Decedents\ViewDecedentAvatarController;
use App\External\Api\Controllers\Cemetery\Interments\StoreIntermentController;
use App\External\Api\Controllers\Cemetery\Plots\BulkGeneratePlotsController;
use App\External\Api\Controllers\Cemetery\Plots\ChangePlotOccupancyController;
use App\External\Api\Controllers\Cemetery\Plots\ChangePlotStatusController;
use App\External\Api\Controllers\Cemetery\Plots\GenerateApartmentNichesController;
use App\External\Api\Controllers\Cemetery\Plots\StorePlotController;
use App\External\Api\Controllers\Cemetery\Plots\StorePlotLeaseController;
use App\External\Api\Controllers\Cemetery\Plots\UpdatePlotDetailsController;
use App\External\Api\Controllers\Cemetery\Plots\UpdatePlotLeaseController;
use App\External\Api\Controllers\Cemetery\Sections\StoreCemeterySectionController;
use App\External\Api\Controllers\Cemetery\Sites\StoreCemeterySiteController;
use App\External\Web\Controllers\Cemetery\Admin\Interments\AssignDecedentToPlotController;
use App\External\Web\Controllers\Cemetery\Admin\Interments\CreateSiteIntermentController;
use App\External\Web\Controllers\Cemetery\Admin\Plots\CreatePlotController;
use App\External\Web\Controllers\Cemetery\Admin\Plots\ShowPlotController;
use App\External\Web\Controllers\Cemetery\Admin\Sites\CreateCemeterySiteController;
use App\External\Web\Controllers\Cemetery\Admin\Sites\ListCemeterySiteController;
use App\External\Web\Controllers\Cemetery\Admin\Sites\ShowCemeterySiteController;
use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\Decedents\CorrectDecedentPageController;
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

                // Cemetery Sites
                Route::prefix('/sites')
                    ->name('sites.')
                    ->group(function () {
                        Route::get('/', ListCemeterySiteController::class)->name('list.page');
                        Route::get('/create', CreateCemeterySiteController::class)->name('create.page');
                        Route::get('/{cemetery_site_id}/plots/create', CreatePlotController::class)
                            ->name('plots.create.page');
                        Route::get('/{cemetery_site_id}/plots/{plot_id}', ShowPlotController::class)
                            ->name('plots.profile.page');
                        Route::get('/{cemetery_site_id}/interments/create', CreateSiteIntermentController::class)
                            ->middleware('permission:cemetery.decedents.manage')
                            ->name('interments.create.page');
                        Route::get('/{cemetery_site_id}', ShowCemeterySiteController::class)
                            ->name('workspace.page');
                    });

                // Decedents
                Route::prefix('decedents')
                    ->name('decedents.')
                    ->group(function () {
                        Route::get('/', IndexDecedentController::class)->name('list.page');
                        Route::get('register', CreateDecedentController::class)->name('create.page');
                        Route::get('profile/{decedent_id}', ShowDecedentController::class)->name('profile.page');
                        Route::get('edit/{decedent_id}', EditDecedentController::class)->name('edit.page');
                        Route::get('{decedent_id}/correct', CorrectDecedentPageController::class)
                            ->middleware('permission:cemetery.decedents.correct')->name('correct.page');
                        Route::get('{decedent_id}/avatar', ViewDecedentAvatarController::class)
                            ->middleware('permission:cemetery.decedents.documents.view')->name('avatar');
                        Route::get('{decedent_id}/documents/{document_id}', DownloadDecedentDocumentController::class)
                            ->middleware('permission:cemetery.decedents.documents.view')->name('documents.download');
                        Route::get('{decedent_id}/correction-evidence/{media_id}', DownloadDecedentCorrectionEvidenceController::class)
                            ->middleware('permission:cemetery.decedents.documents.view')->name('correction-evidence.download');
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
        Route::delete('{decedent_id}', DeleteDraftDecedentController::class)->middleware('permission:cemetery.decedents.manage')->name('destroy');
        Route::post('{decedent_id}/verify', VerifyDecedentController::class)->middleware('permission:cemetery.decedents.verify')->name('verify');
        Route::post('{decedent_id}/documents', StoreDecedentDocumentController::class)->middleware('permission:cemetery.decedents.manage')->name('documents.store');
        Route::delete('{decedent_id}/documents/{document_id}', DeleteDecedentDocumentController::class)
            ->middleware('permission:cemetery.decedents.manage')->name('documents.delete');
        Route::post('{decedent_id}/correct', CorrectDecedentController::class)
            ->middleware('permission:cemetery.decedents.correct')->name('correct');
        Route::post('{decedent_id}/readiness-overrides', CreateReadinessOverrideController::class)
            ->middleware('permission:cemetery.decedents.override')->name('readiness-overrides.store');
    });

Route::prefix('api/cemetery-sites')
    ->name('cemetery-sites.')
    ->middleware(['municipalityContext', 'admin', 'auth', 'permission:cemetery.access'])
    ->group(function () {
        Route::post('store', StoreCemeterySiteController::class)->name('store');
        Route::post('{cemetery_site_id}/sections', StoreCemeterySectionController::class)->name('sections.store');
        Route::post('{cemetery_site_id}/sections/{section_id}/blocks', StoreCemeteryBlockController::class)->name('sections.blocks.store');
        Route::post('{cemetery_site_id}/plots', StorePlotController::class)->name('plots.store');
        Route::patch('{cemetery_site_id}/plots/{plot_id}/details', UpdatePlotDetailsController::class)->name('plots.details.update');
        Route::post('{cemetery_site_id}/plots/{plot_id}/lease', StorePlotLeaseController::class)->name('plots.lease.store');
        Route::patch('{cemetery_site_id}/plots/{plot_id}/lease', UpdatePlotLeaseController::class)->name('plots.lease.update');
        Route::patch('{cemetery_site_id}/plots/{plot_id}/occupancy', ChangePlotOccupancyController::class)->name('plots.occupancy.update');
        Route::patch('{cemetery_site_id}/plots/{plot_id}/status', ChangePlotStatusController::class)->name('plots.status.update');
        Route::post('{cemetery_site_id}/blocks/{block_id}/plots/bulk', BulkGeneratePlotsController::class)->name('blocks.plots.bulk');
        Route::post('{cemetery_site_id}/blocks/{block_id}/plots/apartment', GenerateApartmentNichesController::class)
            ->name('blocks.plots.apartment');
    });

Route::prefix('api/interments')
    ->name('interments.')
    ->middleware(['municipalityContext', 'admin', 'auth', 'permission:cemetery.access'])
    ->group(function () {
        Route::post('store', StoreIntermentController::class)->middleware('permission:cemetery.decedents.manage')->name('store');
    });
