<?php

use App\External\Api\Controllers\Procurement\StoreProcurementsController;
use App\External\Web\Controllers\Procurement\Admin\EditProcurementController;
use App\External\Web\Controllers\Procurement\Admin\ProcurementsPageController;
use App\External\Web\Controllers\Procurement\Admin\ShowProcurementController;
use App\External\Web\Controllers\Procurement\Public\TransparencyPageController;
use Illuminate\Support\Facades\Route;


Route::prefix('{municipality}/procurements')
    ->middleware(['municipalityContext', 'admin'])
    ->name('procurement.admin.')
    ->controller(ProcurementsPageController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

        //test page remove later and use the name('creation);
        // Route::get('/admin/add-edit-procurement', 'addEditShow')->name('create');
    
        Route::get('create-procurement', 'create')->name('create');

        Route::get('/view/{id}', ShowProcurementController::class)->name('show');

        Route::get('/edit/{id}', EditProcurementController::class)->name('edit');

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

            });


    });