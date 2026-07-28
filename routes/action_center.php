<?php

use App\External\Api\Controllers\ActionCenter\Assistance\ApproveAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\CancelAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\RejectAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\ReleaseAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StartAssistanceRequestReviewController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAdminAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\StoreAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\Assistance\UpdateAssistanceRequestController;
use App\External\Api\Controllers\ActionCenter\Assistance\UpdateAssistanceTypeController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\LinkBeneficiaryAccountController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\MergeBeneficiaryController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\ReassignBeneficiaryHouseholdController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\RejectBeneficiaryIntakeController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\ResubmitBeneficiaryProfileCorrectionController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\ReviewBeneficiaryIntakeController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\SearchHouseholdMembershipController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\StoreProfileSetupController;
use App\External\Api\Controllers\ActionCenter\Beneficiary\UpdateBeneficiaryProfileController;
use App\External\Api\Controllers\ActionCenter\Household\ChangeHouseholdHeadController;
use App\External\Api\Controllers\ActionCenter\Household\DeclareHouseholdMemberForAssistanceController;
use App\External\Api\Controllers\ActionCenter\Household\LinkHouseholdMemberToBeneficiaryController;
use App\External\Api\Controllers\ActionCenter\Household\SetHouseholdMemberActiveController;
use App\External\Api\Controllers\ActionCenter\Household\StoreAdminHouseholdMemberController;
use App\External\Api\Controllers\ActionCenter\Household\UnlinkHouseholdMemberBeneficiaryController;
use App\External\Api\Controllers\ActionCenter\Household\UpdateHouseholdMemberController;
use App\External\Api\Controllers\ActionCenter\Walkin\StoreWalkInBeneficiaryController;
use App\External\Documents\ActionCenter\ShowBeneficiaryIdentityDocumentController;
use App\External\Documents\ActionCenter\ReplaceBeneficiaryIdentityDocumentController;
use App\External\Web\Controllers\ActionCenter\Admin\Beneficiary\ListBeneficiaryController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\CreateAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\Document\DownloadAcknowledgementReceiptController;
use App\External\Web\Controllers\ActionCenter\Admin\Document\DownloadAssistanceRequestIntakeSheetController;
use App\External\Web\Controllers\ActionCenter\Admin\Document\DownloadBeneficiaryIdentityDocumentSheetController;
use App\External\Web\Controllers\ActionCenter\Admin\Document\DownloadBeneficiaryIntakeSheetController;
use App\External\Web\Controllers\ActionCenter\Admin\EditAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\EditAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\Beneficiary\EditBeneficiaryProfileController;
use App\External\Web\Controllers\ActionCenter\Admin\Beneficiary\ShowBeneficiaryProfileController;
use App\External\Documents\ActionCenter\ShowBeneficiaryAvatarController;
use App\External\Documents\ActionCenter\UploadBeneficiaryAvatarController;
use App\External\Web\Controllers\ActionCenter\Admin\Beneficiary\ShowBeneficiarySearchController;
use App\External\Web\Controllers\ActionCenter\Admin\ListAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\ListAssistanceTypeController;
use App\External\Web\Controllers\ActionCenter\Admin\ListMyAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Admin\Report\AssistanceRequestReportController;
use App\External\Web\Controllers\ActionCenter\Admin\Report\BeneficiaryRegistryReportController;
use App\External\Web\Controllers\ActionCenter\Admin\Report\ExportAssistanceRequestReportController;
use App\External\Web\Controllers\ActionCenter\Admin\Report\ExportBeneficiaryRegistryReportController;
use App\External\Web\Controllers\ActionCenter\Admin\ShowAssistanceRequestProfileController;
use App\External\Web\Controllers\ActionCenter\Admin\Walkin\ShowCreateWalkInBeneficiaryController;
use App\External\Web\Controllers\ActionCenter\Client\ShowBeneficiaryProfileCorrectionController;
use App\External\Web\Controllers\ActionCenter\Client\ShowClientActionCenterDashboardController;
use App\External\Web\Controllers\ActionCenter\Client\ShowClientAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\ApplyAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\IndexAssistanceRequestController;
use App\External\Web\Controllers\ActionCenter\Public\ShowProfileSetupController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/action-center')
    ->middleware(['auth', 'municipalityContext'])
    ->name('actionCenter.')
    ->group(function () {

        // eg. https://gasan-4905/action-center/admin
        // for admin pages
        Route::prefix('/admin')
            ->middleware(['admin', 'permission:action_center.access'])
            ->name('admin.')
            ->group(function () {

            Route::get('list/assitance-request', ListAssistanceRequestController::class)->name('list.assistance');

            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', AssistanceRequestReportController::class)->name('index');
                Route::get('/assistance-requests/export', ExportAssistanceRequestReportController::class)
                    ->name('assistance.export');
                Route::get('/beneficiaries', BeneficiaryRegistryReportController::class)
                    ->name('beneficiaries');
                Route::get('/beneficiaries/export', ExportBeneficiaryRegistryReportController::class)
                    ->name('beneficiaries.export');
            });

            // Full municipality beneficiary registry. Unlike the interview
            // lookup below, this page intentionally lists records without
            // requiring a search criterion.
            Route::get('beneficiaries', ListBeneficiaryController::class)
                ->name('beneficiary.index');

            // Beneficiary lookup screen used during the interview. Search state
            // lives in the query string (Inertia + URL params).
            Route::get('beneficiary/search', ShowBeneficiarySearchController::class)
                ->name('beneficiary.search');

            // Full LIVE beneficiary review page — household composition + full
            // cross-program assistance history. Drill-down target from the
            // search results and the request-detail page.
            Route::get('beneficiary/{beneficiaryId}/profile', ShowBeneficiaryProfileController::class)
                ->name('beneficiary.profile');

            // Admin-only "correct this beneficiary's profile" form — display
            // only. Identity is pre-filled from the LIVE record; the POST goes
            // to the Api UpdateBeneficiaryProfileController, which syncs the
            // household Head row in the same transaction.
            Route::get('beneficiary/{beneficiaryId}/edit', EditBeneficiaryProfileController::class)
                ->name('beneficiary.edit');

            // Stream a beneficiary's profile photo (private disk → authenticated
            // inline stream). Source for the <img> on the profile, edit form,
            // and search cards. Upload is the API route below.
            Route::get('beneficiary/{beneficiaryId}/avatar', ShowBeneficiaryAvatarController::class)
                ->name('beneficiary.avatar');

            Route::get('beneficiary/{beneficiaryId}/identity-document/{side}', ShowBeneficiaryIdentityDocumentController::class)
                ->whereIn('side', ['front', 'back'])
                ->name('beneficiary.identity-document');

            // Walk-in intake form — display only. The admin encodes a person
            // who has no portal account (user_id stays NULL). Reached from the
            // search page's "no results" state after confirming the applicant
            // isn't already in the registry.
            Route::get('walkin/create', ShowCreateWalkInBeneficiaryController::class)
                ->name('walkin.create');

            // Personal worklist — only under_review cases assigned to the
            // current admin. Pinned scope is set server-side; query-string
            // overrides are ignored. Companion to list.assistance (All Cases).
            Route::get('list/my-assistance-requests', ListMyAssistanceRequestController::class)
                ->name('list.my.assistance');

            // File an assistance request on behalf of a specific beneficiary
            // (walk-in counter, or for an online beneficiary who can't use the
            // portal). Anchored to the verified beneficiary — identity is shown
            // read-only, never re-typed. Display only; POST goes to the Api
            // StoreAdminAssistanceRequestController.
            Route::get('beneficiary/{beneficiaryId}/file-assistance', CreateAssistanceRequestController::class)
                ->name('assistance.create');

            Route::get('create/assistance-type', CreateAssistanceTypeController::class)->name('create.assistance.type');

            Route::get('list/assistance-types', ListAssistanceTypeController::class)->name('list.assistance.types');

            Route::get('edit/assistance-type/{id}', EditAssistanceTypeController::class)->name('edit.assistance-type');

            // Admin request-detail page. `{assistanceRequest}` is route-model
            // bound to App\Core\ActionCenter\Models\AssistanceRequest by ULID.
            // The controller additionally guards that the bound request belongs
            // to the current municipality.
            Route::get('profile/assistance-request/{assistanceRequest}', ShowAssistanceRequestProfileController::class)
                ->name('show.assistance-request.profile');

            Route::get(
                'profile/assistance-request/{assistanceRequestId}/intake-sheet',
                DownloadAssistanceRequestIntakeSheetController::class,
            )->name('assistance-request.intake-sheet');

            Route::get(
                'profile/assistance-request/{assistanceRequestId}/acknowledgement-receipt',
                DownloadAcknowledgementReceiptController::class,
            )->name('assistance-request.acknowledgement-receipt');

            // Admin-only "correct an in-flight request" form — display only.
            // The controller redirects back to the detail page if the request
            // is no longer editable (approved/released/rejected/cancelled). The
            // POST goes to the Api UpdateAssistanceRequestController.
            Route::get('profile/assistance-request/{assistanceRequest}/edit', EditAssistanceRequestController::class)
                ->name('assistance.edit');

            // Download the printable PDF intake sheet for one beneficiary.
            // Tenant + ownership-of-data are enforced inside the action;
            // the admin middleware on the parent group is the coarse gate.
            //
            // URL is plain `/intake-sheet` (no .pdf suffix) — Laravel's router
            // gets fussy about dots in literal path segments. The downloaded
            // file is still named *.pdf because Spatie sets the filename via
            // the Content-Disposition response header in the renderer.
            Route::get(
                'beneficiary/{beneficiaryId}/intake-sheet',
                DownloadBeneficiaryIntakeSheetController::class,
            )->name('beneficiary.intake-sheet');

            Route::get(
                'beneficiary/{beneficiaryId}/identity-document-sheet',
                DownloadBeneficiaryIdentityDocumentSheetController::class,
            )->name('beneficiary.identity-document-sheet');
        });

        // for non admin pages
        Route::get('/profile/setup', ShowProfileSetupController::class)->name('profile.setup');

        Route::get('/profile/correction', ShowBeneficiaryProfileCorrectionController::class)->name('profile.correction');

        Route::get('/portal', IndexAssistanceRequestController::class)->name('portal');

        Route::get('/', ShowClientActionCenterDashboardController::class)->name('index');

        Route::get('/requests/{assistanceRequestId}', ShowClientAssistanceRequestController::class)->name('show');

        // need to change place to api
        Route::get('/apply/{assistanceType:slug}', ApplyAssistanceRequestController::class)
            ->name('apply.assistance');

        Route::post('/apply/{assistanceType:slug}', StoreAssistanceRequestController::class)
            ->middleware('throttle:5,1')
            ->name('apply.assistance.store');

    });

// eg. https://api/action-center
Route::prefix('/api/action-center')
    ->name('actionCenter.')
    ->group(function () {

        Route::middleware(['municipalityContext', 'admin', 'permission:action_center.access'])
            ->group(function () {
                Route::post('store/assistance-type', StoreAssistanceTypeController::class)->name('assistance.type.store');

                Route::put('update/assistance-type/{typeId}', UpdateAssistanceTypeController::class)->name('assistance.type.update');

                Route::post(
                    '/assistance-request/{assistanceRequestId}/start-review',
                    StartAssistanceRequestReviewController::class,
                )->name('assistance.start-review');

                // Admin correction of an in-flight request's content (description
                // + document scans). POST + multipart for the uploads. The action
                // tenant-guards, enforces the pending/under_review editability
                // gate, replaces media by document_key, and audits the edit.
                Route::post(
                    '/assistance-request/{assistanceRequestId}/update',
                    UpdateAssistanceRequestController::class,
                )->name('assistance.update');

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

                // Link a beneficiary to a portal account, or change which
                // account it points to. Deliberate, audited admin action done
                // at interview time against the verified government ID — keeps
                // ONE lifelong record per person instead of spawning duplicates.
                // All rules + the audit trail live in the action.
                Route::post(
                    '/beneficiary/{beneficiaryId}/link-account',
                    LinkBeneficiaryAccountController::class,
                )->name('beneficiary.link-account');

                // Non-destructive duplicate merge: mark {beneficiaryId} as a
                // duplicate and link it into the canonical record (by number).
                // Deactivates the duplicate's account, flags the canonical, and
                // resolves the two as one identity group going forward. All
                // guards + audit live in MergeBeneficiaryAction.
                Route::post(
                    '/beneficiary/{beneficiaryId}/merge',
                    MergeBeneficiaryController::class,
                )->name('beneficiary.merge');

                // Admin correction of a beneficiary's identity / demographics /
                // income. The action tenant-guards the record, updates it, and
                // syncs the household Head row in the same transaction. Audited
                // automatically via the models' LogsActivity trait.
                Route::put(
                    '/beneficiary/{beneficiaryId}',
                    UpdateBeneficiaryProfileController::class,
                )->name('beneficiary.update');

                Route::post(
                    '/beneficiary/{beneficiaryId}/review-intake',
                    ReviewBeneficiaryIntakeController::class,
                )->name('beneficiary.review-intake');

                Route::post(
                    '/beneficiary/{beneficiaryId}/reject-intake',
                    RejectBeneficiaryIntakeController::class,
                )->name('beneficiary.reject-intake');

                Route::post(
                    '/beneficiary/{beneficiaryId}/reassign-household',
                    ReassignBeneficiaryHouseholdController::class,
                )->name('beneficiary.reassign-household');

                Route::get(
                    '/beneficiary/{beneficiaryId}/household-members/search',
                    SearchHouseholdMembershipController::class,
                )->name('beneficiary.household-members.search');

                // Upload / replace a beneficiary's profile photo (webcam → PC).
                // Admin-only; single-file replace handled in the action.
                Route::post(
                    '/beneficiary/{beneficiaryId}/avatar',
                    UploadBeneficiaryAvatarController::class,
                )->name('beneficiary.avatar.upload');

                Route::post(
                    '/beneficiary/{beneficiaryId}/identity-document/{side}',
                    ReplaceBeneficiaryIdentityDocumentController::class,
                )->whereIn('side', ['front', 'back'])
                    ->name('beneficiary.identity-document.replace');

                // ── Admin household-roster management ─────────────────────────
                // Edit a non-head member, toggle moved-out (is_active, never
                // delete), or add a new member to an existing household. Tenant
                // + head-row guards live in the actions.
                Route::put('/household/members/{memberId}', UpdateHouseholdMemberController::class)
                    ->name('household.members.update');

                Route::post('/household/members/{memberId}/set-active', SetHouseholdMemberActiveController::class)
                    ->name('household.members.set-active');

                Route::post('/households/{householdId}/change-head', ChangeHouseholdHeadController::class)
                    ->name('household.change-head');

                Route::post('/beneficiary/{beneficiaryId}/household/members', StoreAdminHouseholdMemberController::class)
                    ->name('household.members.admin-store');

                // Link, don't duplicate: reconcile a roster row to an existing
                // beneficiary (by beneficiary number) without moving that
                // person's own primary household.
                Route::post('/household/members/{memberId}/link-beneficiary', LinkHouseholdMemberToBeneficiaryController::class)
                    ->name('household.members.link');

                Route::post('/household/members/{memberId}/unlink-beneficiary', UnlinkHouseholdMemberBeneficiaryController::class)
                    ->name('household.members.unlink');

                // Encode a walk-in beneficiary (no portal account). Mirrors the
                // online profile-setup store, minus the user_id, plus a soft
                // name+DOB duplicate guard. Rules + audit live in the action.
                Route::post('/walkin', StoreWalkInBeneficiaryController::class)
                    ->name('walkin.store');

                // Admin-encoded assistance request, filed on behalf of a
                // beneficiary. Reuses StoreAssistanceRequestAction with
                // encoded_by_user_id = the acting admin. Tenant via header.
                Route::post('/assistance-request', StoreAdminAssistanceRequestController::class)
                    ->name('assistance.admin-store');
            });

        Route::middleware(['auth', 'municipalityContext'])
            ->group(function () {

                Route::post('/profile/setup', StoreProfileSetupController::class)->name('profile.setup.store');

                Route::post('/profile/correction', ResubmitBeneficiaryProfileCorrectionController::class)
                    ->name('profile.correction.store');

                // Inline "Add a new family member" from the Apply form.
                Route::post('/household/members', DeclareHouseholdMemberForAssistanceController::class)
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
