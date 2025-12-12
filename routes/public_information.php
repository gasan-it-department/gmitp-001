<?php


use App\External\Api\Controllers\PublicInformation\ProcurementsController;
use App\External\Web\Controllers\PublicInformation\Admin\ProcurementsPageController;

Route::prefix('{municipality}/awards-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('awardsAdminPage.')
    ->controller(ProcurementsPageController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

        Route::get('/admin/add-edit-procurement', 'addEditShow')->name('addEditPage');

    });


Route::prefix('api/public-information')
    ->middleware(['municipalityContext'])
    ->name('publicInformation.')
    ->controller(ProcurementsController::class)
    ->group(function () {

        Route::middleware(['admin', 'auth:sanctum', 'municipalityContext'])
            ->group(function () {

                Route::post('/store', 'store')->name('store');

                Route::get('/', 'fetch')->name('fetch');

                Route::get('/{id}', 'show')->name('show');

            });


    });