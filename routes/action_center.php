<?php

use App\External\Api\Controllers\ActionCenter\Assistance\ApproveAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\CancelAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\RejectAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\ReleaseAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StartAssistanceRequestReviewController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\Assistance\UpdateAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\StoreProfileSetupController;
use App\External\Api\Controllers\ActionCenter\Household\StoreInlineHouseholdMemberController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\EditAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\ListAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\ListAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\ListMyAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\ShowAssistanceRequestProfileController;
use App\External\Web\Controllers\ActionCenter\Client\ClientActionCenterController;
use App\External\Web\Controllers\ActionCenter\Client\HouseholdController;
use App\External\Web\Controllers\ActionCenter\Public\ApplyAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\IndexAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\ShowProfileSetupController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/action-center')
    ->middleware(['auth', 'municipalityContext'])
    ->name('actionCenter.')
    ->group(function () {


        //eg. https://gasan-4905/action-center/admin
        // for admin pages
        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

            Route::get('list/assitance-request', ListAssistanceRequestController::class)->name('list.assistance');

            // Personal worklist — only under_review cases assigned to the
            // current admin. Pinned scope is set server-side; query-string
            // overrides are ignored. Companion to list.assistance (All Cases).
            Route::get('list/my-assistance-requests', ListMyAssistanceRequestController::class)
                ->name('list.my.assistance');

            Route::get('create', CreateAssistanceRequestController::class)->name('assistance.create');

            Route::get('create/assistance-type', CreateAssistanceTypeController::class)->name('create.assistance.type');

            Route::get('list/assistance-types', ListAssistanceTypeController::class)->name('list.assistance.types');

            Route::get('edit/assistance-type/{id}', EditAssistanceTypeController::class)->name('edit.assistance-type');

            // Admin request-detail page. `{assistanceRequest}` is route-model
            // bound to App\Core\ActionCenter\Models\AssistanceRequest by ULID.
            // The controller additionally guards that the bound request belongs
            // to the current municipality.
            Route::get('profile/assistance-request/{assistanceRequest}', ShowAssistanceRequestProfileController::class)
                ->name('show.assistance-request.profile');
        });

        //for non admin pages 
        Route::get('/profile/setup', ShowProfileSetupController::class)->name('profile.setup');

        Route::get('/portal', IndexAssistanceRequestController::class)->name('portal');

        Route::get('/', [ClientActionCenterController::class, 'index'])->name('index');

        Route::get('/household', [HouseholdController::class, 'index'])->name('household.index');

        //need to change place to api
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

                Route::post(
                    '/assistance-request/{assistanceRequestId}/start-review',
                    StartAssistanceRequestReviewController::class,
                )->name('assistance.start-review');

                // Approve a case — commits the amount and writes cooldown rows.
                // Sibling to start-review; both follow the same thin-controller
                // + heavy-lifting-action pattern.
                Route::post(
                    '/assistance-request/{assistanceRequestId}/approve',
                    ApproveAssistanceRequestController::class,
                )->name('assistance.approve');

                // Reject a case — moves status to Rejected and appends the
                // reviewer's reason to remarks. No cooldown is written
                // (rejection doesn't block future applications).
                Route::post(
                    '/assistance-request/{assistanceRequestId}/reject',
                    RejectAssistanceRequestController::class,
                )->name('assistance.reject');

                // Mark as Released — cashier records the physical
                // disbursement. Terminal, COA-immutable. Requires an
                // OR/voucher reference number that is unique within
                // the municipality.
                Route::post(
                    '/assistance-request/{assistanceRequestId}/release',
                    ReleaseAssistanceRequestController::class,
                )->name('assistance.release');
            });

        Route::middleware(['auth', 'municipalityContext'])
            ->group(function () {

                Route::post('/profile/setup', StoreProfileSetupController::class)->name('profile.setup.store');

                // Inline "Add a new family member" from the Apply form.
                Route::post('/household/members', StoreInlineHouseholdMemberController::class)
                    ->name('household.members.store');

                // Citizen-initiated cancellation of their own pending /
                // under_review assistance request. Ownership is enforced
                // inside the action (against beneficiary.user_id).
                Route::post(
                    '/assistance-request/{assistanceRequestId}/cancel',
                    CancelAssistanceRequestController::class,
                )->name('assistance.cancel');

            });

    });





