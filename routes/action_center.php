<?php

use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\ActionCenter\ActionCenterController;
use App\External\Api\Controllers\ActionCenter\BeneficiaryFlagController;
use App\External\Web\Controllers\ActionCenter\Client\HouseholdController;
use App\External\Api\Controllers\ActionCenter\AssistanceRequestController;

use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Web\Controllers\ActionCenter\Client\ClientActionCenterController;
use App\External\Web\Controllers\ActionCenter\Client\AssistanceRequestPageController;
use App\External\Api\Controllers\ActionCenter\Actions\CancelAssistanceRequestController;

Route::prefix('{municipality}/action-center')
    ->middleware(['auth', 'municipalityContext'])
    ->name('actionCenter.')
    ->group(function () {


        //eg. https://gasan-4905/action-center/admin
        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

            Route::get('/', [AdminActionCenterController::class, 'index'])
                ->name('index');

            Route::get('/assistance-request/{id}', [AdminActionCenterController::class, 'show'])
                ->name('show');
        });

        //eg. https://gasan-4905/action-center/beneficiary
        Route::get('/', [ClientActionCenterController::class, 'index'])->name('index');

        Route::get('/household', [HouseholdController::class, 'index'])->name('household.index');

        Route::get('/create-request', [AssistanceRequestPageController::class, 'create'])->name('create.request');

    });

//eg. https://api/action-center
Route::prefix('/api/action-center')
    ->name('actionCenter.')
    ->controller(ActionCenterController::class)
    ->group(function () {

        Route::middleware(['municipalityContext', 'admin'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::get('/status-labels', 'getStatusList')->name('status');

                Route::put('/set-amount/{id}', [AssistanceRequestController::class, 'setAmount'])->name('setAmount');

                Route::post('/beneficiaries/{id}/flag', [BeneficiaryFlagController::class, 'store'])
                    ->name('beneficiaries.flag');

            });

        Route::middleware(['auth', 'municipalityContext'])
            ->group(function () {

                Route::get('/mine', 'fetchMine')->name('mine');

                Route::post('/', 'store')->name('store');

                Route::put('/{id}', 'update')->name('update');

                Route::post('/{municipality}/action-center/requests/{id}/cancel', [AssistanceRequestController::class, 'cancel'])
                    ->name('citizen.action-center.cancel');

                Route::get('/{id}', 'show')->name('show');

                Route::get('/assistance/types', 'getAssistanceTypesList')->name('assistanceTypes');

                Route::put('/cancel/{id}', CancelAssistanceRequestController::class)->name('assistance.cancel');

            });


    });





