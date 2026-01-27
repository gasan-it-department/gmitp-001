<?php


use App\External\Api\Controllers\PublicInformation\ProcurementsController;
use App\External\Web\Controllers\PublicInformation\Admin\ProcurementsPageController;
use App\External\Web\Controllers\PublicInformation\Client;

Route::prefix('{municipality}/awards')
    ->middleware(['municipalityContext', 'admin'])
    ->name('procurement.admin.')
    ->controller(ProcurementsPageController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

        //test page remove later and use the name('creation);
        // Route::get('/admin/add-edit-procurement', 'addEditShow')->name('create');
    
        Route::get('create-procurement', 'create')->name('create');
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
    ->controller(ProcurementsController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth', 'municipalityContext'])
            ->group(function () {

                Route::post('/store', 'store')->name('store');

                Route::get('/', 'fetch')->name('fetch');

                Route::get('/{id}', 'show')->name('show');

            });


    });