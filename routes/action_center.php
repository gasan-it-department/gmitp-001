<?php

use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Api\Controllers\ActionCenter\ActionCenterController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/action-center')
    ->middleware(['auth:sanctum', 'municipalityContext'])
    ->name('actionCenter.')
    ->group(function () {


        //eg. https://gasan-4905/action-center/admin
        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

            Route::get('/', [AdminActionCenterController::class, 'index'])
                ->name('index');
        });

        //eg. https://gasan-4905/action-center/beneficiary
        // Route::get('/', [ClientActionCenterController::class, 'index'])->name('index'); uncomment later for client view for action center
    


    });

//eg. https://api/action-center
Route::prefix('/api/action-center')
    ->name('actionCenter.')
    ->controller(ActionCenterController::class)
    ->group(function () {

        Route::middleware('admin')
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch')->middleware('municipalityContext');

                Route::get('/status-labels', 'getStatusList')->name('status');


            });

        Route::middleware(['auth:sanctum', 'municipalityContext'])
            ->group(function () {

                Route::get('/mine', 'fetchMine')->name('mine');

                Route::post('/', 'store')->name('store');

                Route::put('/{id}', 'update')->name('update');

                Route::delete('/{id}', action: 'destroy')->name('destroy');

                Route::get('/{id}', 'show')->name('show');

                Route::get('/assistance/types', 'getAssistanceTypesList')->name('assistanceTypes');


            });


    });





