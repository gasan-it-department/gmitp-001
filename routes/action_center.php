<?php

use App\External\Api\Controllers\ActionCenter\Actions\CancelAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\Assistance\UpdateAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\EditAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\ListAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Client\ClientActionCenterController;
use App\External\Web\Controllers\ActionCenter\Client\HouseholdController;
use App\External\Web\Controllers\ActionCenter\Public\ApplyAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\IndexAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\StoreProfileSetupController;
use App\External\Web\Controllers\ActionCenter\Public\ShowProfileSetupController;
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

        // Profile setup wizard — first-time users only.
        //   GET  /{municipality}/action-center/profile/setup  → show the form
        //   POST /{municipality}/action-center/profile/setup  → save and redirect to portal
        Route::get('/profile/setup', ShowProfileSetupController::class)->name('profile.setup');

        //eg. https://gasan-4905/action-center/beneficiary
        Route::get('/portal', IndexAssistanceRequestController::class)->name('portal');

        Route::get('/', [ClientActionCenterController::class, 'index'])->name('index');

        Route::get('/household', [HouseholdController::class, 'index'])->name('household.index');

        // Apply for assistance — slug-resolved, scoped to the current municipality
        // via AssistanceType::resolveRouteBinding().
        //   GET  /{municipality}/action-center/apply/medical   → renders the form
        //   POST /{municipality}/action-center/apply/medical   → submits the request
        Route::get('/apply/{assistanceType:slug}', ApplyAssistanceRequestController::class)
            ->name('apply.assistance');

        Route::post('/apply/{assistanceType:slug}', StoreAssistanceRequestController::class)
            ->name('apply.assistance.store');

    });





//eg. https://api/action-center
Route::prefix('/api/action-center')
    ->name('actionCenter.')
    ->group(function () {

        Route::middleware(['municipalityContext', 'admin'])
            ->group(function () {
                Route::post('store/assistance-type', StoreAssistanceTypeController::class)->name('assistance.type.store');

                Route::put('update/assistance-type/{typeId}', UpdateAssistanceTypeController::class)->name('assistance.type.update');
            });

        Route::middleware(['auth', 'municipalityContext'])
            ->group(function () {

                Route::post('/profile/setup', StoreProfileSetupController::class)->name('profile.setup.store');


            });


    });





