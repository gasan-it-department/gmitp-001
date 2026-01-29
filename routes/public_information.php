<?php


use App\External\Web\Controllers\PublicInformation\Admin\ShowProcurementController;
use App\External\Web\Controllers\PublicInformation\Client;
use App\External\Api\Controllers\PublicInformation\StoreProcurementsController;
use App\External\Web\Controllers\PublicInformation\Admin\ProcurementsPageController;

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

    });

Route::prefix('{municipality}/transparency')
    ->middleware(['municipalityContext'])
    ->name('transparency.')
    ->controller(Client\ProcuremenstPageController::class)
    ->group(function () {

        Route::get('/', 'index')->name('index');

    });

//api for procurement
Route::prefix('api/public-information')
    ->middleware(['municipalityContext'])
    ->name('publicInformation.')
    ->group(function () {

        Route::middleware(['admin', 'auth', 'municipalityContext'])
            ->group(function () {

                Route::post('/procurement-store', StoreProcurementsController::class)->name('store');

            });


    });