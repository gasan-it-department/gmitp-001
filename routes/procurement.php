<?php

use App\External\Api\Controllers\Procurement\AwardProcurementController;
use App\External\Api\Controllers\Procurement\DeclareFailureProcurementController;
use App\External\Api\Controllers\Procurement\DeleteProcurementController;
use App\External\Api\Controllers\Procurement\EvaluateProcurementController;
use App\External\Api\Controllers\Procurement\Media\DeleteProcurementMediaController;
use App\External\Api\Controllers\Procurement\Media\UploadProcurementMediaController;
use App\External\Api\Controllers\Procurement\OpenProcurementController;
use App\External\Api\Controllers\Procurement\StoreProcurementsController;
use App\External\Api\Controllers\Procurement\UpdateProcurementController;
use App\External\Web\Controllers\Procurement\Admin\CreateProcurementController;
use App\External\Web\Controllers\Procurement\Admin\EditProcurementController;
use App\External\Web\Controllers\Procurement\Admin\ListProcurementController;
use App\External\Web\Controllers\Procurement\Admin\ShowProcurementController;
use App\External\Web\Controllers\Procurement\Public\ShowPublicProcurementController;
use App\External\Web\Controllers\Procurement\Public\TransparencyPageController;
use Illuminate\Support\Facades\Route;


Route::prefix('{municipality}/procurements')
    ->middleware(['municipalityContext', 'admin'])
    ->name('procurement.admin.')
    ->group(function () {

        Route::get('admin', ListProcurementController::class)->name('page');

        Route::get('create', CreateProcurementController::class)->name('create');

        Route::get('view/{id}', ShowProcurementController::class)->name('show');

        Route::get('edit/{id}', EditProcurementController::class)->name('edit');

    });

Route::prefix('{municipality}/transparency')
    ->middleware(['municipalityContext'])
    ->name('transparency.')
    ->group(function () {

        Route::get('/', TransparencyPageController::class)->name('index');

        Route::get('details/{procurementId}', ShowPublicProcurementController::class)->name('show');

    });

//api for procurement
Route::prefix('api/procurement')
    ->middleware(['municipalityContext'])
    ->name('procurement.')
    ->group(function () {

        Route::middleware(['admin', 'auth', 'municipalityContext'])
            ->group(function () {

                Route::post('/procurement-store', StoreProcurementsController::class)->name('store');

                Route::put('{procurementId}/open/', OpenProcurementController::class)->name('status.open');

                Route::post('{procurementId}/media/upload', UploadProcurementMediaController::class)->name('media.upload');

                Route::delete('{procurementId}/media/{mediaId}', DeleteProcurementMediaController::class)->name('media.delete');

                Route::delete('delete/procurement/{procurementId}', DeleteProcurementController::class)->name('delete.draft');

                Route::put('update/procurement/{procurementId}', UpdateProcurementController::class)->name('update');

                Route::patch('evaluate/{procurementId}', EvaluateProcurementController::class)->name('evaluate');

                Route::put('award/{procurementId}', AwardProcurementController::class)->name('award');

                Route::put('fail/{procurementId}', DeclareFailureProcurementController::class)->name('fail');
            });


    });