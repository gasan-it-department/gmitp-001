<?php

use App\External\Api\Controllers\Procurement\DeleteProcurementController;
use App\External\Api\Controllers\Procurement\Document\DeleteProcurementDocumentController;
use App\External\Api\Controllers\Procurement\Document\DownloadProcurementDocumentController;
use App\External\Api\Controllers\Procurement\Document\GenerateProcurementDocumentController;
use App\External\Api\Controllers\Procurement\Document\StoreProcurementDocumentController;
use App\External\Api\Controllers\Procurement\Document\ViewProcurementDocumentController;
use App\External\Api\Controllers\Procurement\EvaluateProcurementController;
use App\External\Api\Controllers\Procurement\OpenProcurementController;
use App\External\Api\Controllers\Procurement\StoreProcurementsController;
use App\External\Api\Controllers\Procurement\UpdateProcurementController;
use App\External\Web\Controllers\Procurement\Admin\CreateProcurementController;
use App\External\Web\Controllers\Procurement\Admin\EditProcurementController;
use App\External\Web\Controllers\Procurement\Admin\ListProcurementController;
use App\External\Web\Controllers\Procurement\Admin\ShowProcurementController;
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
    ->controller(TransparencyPageController::class)
    ->group(function () {

        Route::get('/', 'index')->name('index');

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

                Route::get('documents/{documentId}/download', DownloadProcurementDocumentController::class)->name('download.document');

                Route::get('documents/{documentId}/view', ViewProcurementDocumentController::class)->name('view.document');

                Route::post('document/upload/{procurementId}', StoreProcurementDocumentController::class)->name('document.upload');

                Route::post('document/generate/upload/url/{procurementId}', GenerateProcurementDocumentController::class)->name('generate.upload');

                Route::delete('delete/procurement/document/{procurementId}/{documentId}', DeleteProcurementDocumentController::class)->name('document.delete');

                Route::delete('delete/procurement/{procurementId}', DeleteProcurementController::class)->name('delete.draft');

                Route::put('update/procurement/{procurementId}', UpdateProcurementController::class)->name('update');

                Route::patch('evaluate/{procurementId}', EvaluateProcurementController::class)->name('evaluate');
            });


    });