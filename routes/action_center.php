<?php

use App\External\Api\Controllers\ActionCenter\ActionCenterController;
use App\External\Api\Controllers\ActionCenter\Actions\CancelAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\Assistance\UpdateAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\AssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\BeneficiaryFlagController;
use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\EditAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\ListAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Client\AssistanceRequestPageController;
use App\External\Web\Controllers\ActionCenter\Client\ClientActionCenterController;
use App\External\Web\Controllers\ActionCenter\Client\HouseholdController;
use App\External\Web\Controllers\ActionCenter\Public\ApplyAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\IndexAssistanceRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/action-center')
    ->middleware(['auth', 'municipalityContext'])
    ->name('actionCenter.')
    ->group(function () {


        //eg. https://gasan-4905/action-center/admin
        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

            Route::get('/', [AdminActionCenterController::class, 'index'])->name('index');

            Route::get('/assistance-request/{id}', [AdminActionCenterController::class, 'show'])->name('show');

            Route::get('create', CreateAssistanceRequestController::class)->name('assistance.create');

            Route::get('create/assistance-type', CreateAssistanceTypeController::class)->name('create.assistance.type');

            Route::get('list/assistance-types', ListAssistanceTypeController::class)->name('list.assistance.types');

            Route::get('edit/assistance-type/{id}', EditAssistanceTypeController::class)->name('edit.assistance-type');
        });

        //eg. https://gasan-4905/action-center/beneficiary
        Route::get('/portal', IndexAssistanceRequestController::class)->name('portal');

        Route::get('/', [ClientActionCenterController::class, 'index'])->name('index');

        Route::get('/household', [HouseholdController::class, 'index'])->name('household.index');

        // Route::get('/create-request', [AssistanceRequestPageController::class, 'create'])->name('create.request');
    
        Route::get('/apply/assistance-request/', ApplyAssistanceRequestController::class)->name('apply.assistance');

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

                Route::post('store/assistance-type', StoreAssistanceTypeController::class)->name('assistance.type.store');

                Route::put('update/assistance-type/{typeId}', UpdateAssistanceTypeController::class)->name('assistance.type.update');
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





