<?php

use App\External\Api\Controllers\GoodsDistribution\BeginGoodsRegistrationController;
use App\External\Api\Controllers\GoodsDistribution\CheckGoodsRecipientController;
use App\External\Api\Controllers\GoodsDistribution\CooldownContextController;
use App\External\Api\Controllers\GoodsDistribution\DistributionRequestController;
use App\External\Api\Controllers\GoodsDistribution\InventoryCommandController;
use App\External\Api\Controllers\GoodsDistribution\ItemLookupController;
use App\External\Api\Controllers\GoodsDistribution\ProgramItemController;
use App\External\Api\Controllers\GoodsDistribution\SearchRegistrationHouseholdsController;
use App\External\Api\Controllers\GoodsDistribution\StoreGoodsRecipientController;
use App\External\Web\Controllers\GoodsDistribution\DownloadDistributionDocumentController;
use App\External\Web\Controllers\GoodsDistribution\ShowDistributionRequestsController;
use App\External\Web\Controllers\GoodsDistribution\ShowGoodsInventoryController;
use App\External\Web\Controllers\GoodsDistribution\ShowGoodsRecipientProfileController;
use App\External\Web\Controllers\GoodsDistribution\ShowGoodsRecipientsController;
use App\External\Web\Controllers\GoodsDistribution\ShowGoodsRegistrationController;
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\GoodsDistribution\BulkDispatchController;
use App\External\Api\Controllers\GoodsDistribution\BulkDispatchRecipientController;
use App\External\Api\Controllers\GoodsDistribution\BulkAdditionalIssueController;
use App\External\Web\Controllers\GoodsDistribution\ShowBulkDispatchesController;
use App\External\Web\Controllers\GoodsDistribution\DownloadBulkDispatchEvidenceController;

Route::middleware(['auth', 'municipalityContext', 'admin', 'permission:goods_distribution.access', 'permission:goods_distribution.bulk_dispatches.view'])
    ->name('goodsDistribution.bulk.')->group(function () {
        Route::prefix('{municipality}/goods-distribution/bulk-dispatches')->group(function () {
            Route::get('/', ShowBulkDispatchesController::class)->defaults('screen', 'list')->name('index');
            Route::get('/create', ShowBulkDispatchesController::class)->defaults('screen', 'create')->middleware('permission:goods_distribution.bulk_dispatches.prepare')->name('create');
            Route::get('/{dispatchId}/edit', ShowBulkDispatchesController::class)->whereUlid('dispatchId')->defaults('screen', 'edit')->middleware('permission:goods_distribution.bulk_dispatches.prepare')->name('edit');
            Route::get('/{dispatchId}/attachments/{mediaId}', DownloadBulkDispatchEvidenceController::class)->whereUlid('dispatchId')->whereNumber('mediaId')->name('attachment');
            Route::get('/{dispatchId}', ShowBulkDispatchesController::class)->whereUlid('dispatchId')->defaults('screen', 'detail')->name('show');
        });
        Route::prefix('api/goods-distribution/bulk-dispatches')->name('api.')->group(function () {
            Route::prefix('/{dispatchId}/additional-issues')->whereUlid('dispatchId')->name('additional.')->group(function () {
                Route::post('/', BulkAdditionalIssueController::class)->defaults('additionalCommand', 'create')->middleware('permission:goods_distribution.bulk_dispatches.prepare')->name('store');
                Route::post('/{issueId}/preview', BulkAdditionalIssueController::class)->whereUlid('issueId')->defaults('additionalCommand', 'preview')->middleware('permission:goods_distribution.bulk_dispatches.approve')->name('preview');
                Route::post('/{issueId}/approve', BulkAdditionalIssueController::class)->whereUlid('issueId')->defaults('additionalCommand', 'approve')->middleware('permission:goods_distribution.bulk_dispatches.approve')->name('approve');
                Route::post('/{issueId}/issue', BulkAdditionalIssueController::class)->whereUlid('issueId')->defaults('additionalCommand', 'issue')->middleware('permission:goods_distribution.bulk_dispatches.dispatch')->name('issue');
                Route::post('/{issueId}/cancel', BulkAdditionalIssueController::class)->whereUlid('issueId')->defaults('additionalCommand', 'cancel')->middleware('permission:goods_distribution.bulk_dispatches.prepare|goods_distribution.bulk_dispatches.approve')->name('cancel');
            });
            Route::prefix('/{dispatchId}/recipients')->whereUlid('dispatchId')->name('recipients.')->group(function () {
                Route::get('/', [BulkDispatchRecipientController::class, 'read'])->name('index');
                Route::get('/candidates', [BulkDispatchRecipientController::class, 'read'])->defaults('lookup', 'candidates')->name('candidates');
                Route::get('/{recipientId}', [BulkDispatchRecipientController::class, 'read'])->whereUlid('recipientId')->name('show');
                Route::post('/', [BulkDispatchRecipientController::class, 'save'])->defaults('recipientCommand', 'create')->middleware('permission:goods_distribution.bulk_dispatches.reconcile')->name('store');
                Route::patch('/{recipientId}/complete', [BulkDispatchRecipientController::class, 'save'])->whereUlid('recipientId')->defaults('recipientCommand', 'complete')->middleware('permission:goods_distribution.bulk_dispatches.reconcile')->name('complete');
                Route::patch('/{recipientId}/correct', [BulkDispatchRecipientController::class, 'save'])->whereUlid('recipientId')->defaults('recipientCommand', 'correct')->middleware('permission:goods_distribution.bulk_dispatches.correct')->name('correct');
                Route::post('/{recipientId}/void', [BulkDispatchRecipientController::class, 'save'])->whereUlid('recipientId')->defaults('recipientCommand', 'void')->middleware('permission:goods_distribution.bulk_dispatches.correct')->name('void');
            });
            Route::get('/items', [BulkDispatchController::class, 'items'])->name('items');
            Route::post('/', [BulkDispatchController::class, 'save'])->middleware('permission:goods_distribution.bulk_dispatches.prepare')->name('store');
            Route::patch('/{dispatchId}', [BulkDispatchController::class, 'save'])->whereUlid('dispatchId')->middleware('permission:goods_distribution.bulk_dispatches.prepare')->name('update');
            Route::post('/{dispatchId}/approval-preview', [BulkDispatchController::class, 'preview'])->whereUlid('dispatchId')->defaults('command', 'approval-preview')->middleware('permission:goods_distribution.bulk_dispatches.approve')->name('approvalPreview');
            Route::post('/{dispatchId}/reconciliation-preview', [BulkDispatchController::class, 'preview'])->whereUlid('dispatchId')->defaults('command', 'reconciliation-preview')->middleware('permission:goods_distribution.bulk_dispatches.reconcile')->name('reconciliationPreview');
            Route::post('/{dispatchId}/approve', [BulkDispatchController::class, 'transition'])->whereUlid('dispatchId')->defaults('command', 'approve')->middleware('permission:goods_distribution.bulk_dispatches.approve')->name('approve');
            Route::post('/{dispatchId}/withdraw', [BulkDispatchController::class, 'transition'])->whereUlid('dispatchId')->defaults('command', 'withdraw')->middleware('permission:goods_distribution.bulk_dispatches.approve')->name('withdraw');
            Route::post('/{dispatchId}/cancel', [BulkDispatchController::class, 'transition'])->whereUlid('dispatchId')->defaults('command', 'cancel')->middleware('permission:goods_distribution.bulk_dispatches.prepare|goods_distribution.bulk_dispatches.approve')->name('cancel');
            Route::post('/{dispatchId}/dispatch', [BulkDispatchController::class, 'transition'])->whereUlid('dispatchId')->defaults('command', 'dispatch')->middleware('permission:goods_distribution.bulk_dispatches.dispatch')->name('dispatch');
            Route::post('/{dispatchId}/close', [BulkDispatchController::class, 'transition'])->whereUlid('dispatchId')->defaults('command', 'close')->middleware('permission:goods_distribution.bulk_dispatches.reconcile')->name('close');
            Route::post('/{dispatchId}/reopen', [BulkDispatchController::class, 'transition'])->whereUlid('dispatchId')->defaults('command', 'reopen')->middleware('permission:goods_distribution.bulk_dispatches.correct')->name('reopen');
            Route::post('/{dispatchId}/report', [BulkDispatchController::class, 'reconcile'])->whereUlid('dispatchId')->defaults('command', 'report')->middleware('permission:goods_distribution.bulk_dispatches.reconcile')->name('report');
            Route::post('/{dispatchId}/return', [BulkDispatchController::class, 'reconcile'])->whereUlid('dispatchId')->defaults('command', 'return')->middleware('permission:goods_distribution.bulk_dispatches.reconcile')->name('returnGoods');
            Route::post('/{dispatchId}/reverse-reconciliation', [BulkDispatchController::class, 'reconcile'])->whereUlid('dispatchId')->defaults('command', 'reverse')->middleware('permission:goods_distribution.bulk_dispatches.correct')->name('reverse');
            Route::post('/{dispatchId}/attachments', [BulkDispatchController::class, 'attachment'])->whereUlid('dispatchId')->middleware('permission:goods_distribution.bulk_dispatches.prepare|goods_distribution.bulk_dispatches.reconcile')->name('attachments');
        });
    });

Route::middleware(['auth', 'municipalityContext', 'admin', 'permission:goods_distribution.access', 'permission:goods_distribution.requests.view'])
    ->prefix('{municipality}/goods-distribution')->name('goodsDistribution.')->group(function () {
        Route::get('/recipients/{beneficiaryId}', ShowGoodsRecipientProfileController::class)->whereUlid('beneficiaryId')->name('recipient.show');
        Route::get('/household-members/{memberId}', ShowGoodsRecipientProfileController::class)->whereUlid('memberId')->name('member.show');
    });

Route::middleware(['auth', 'municipalityContext', 'admin', 'permission:goods_distribution.access', 'permission:goods_distribution.requests.view'])
    ->name('goodsDistribution.requests.')->group(function () {
        Route::prefix('{municipality}/goods-distribution/distribution')->group(function () {
            Route::get('/', ShowDistributionRequestsController::class)->defaults('screen', 'list')->name('index');
            Route::get('/create', ShowDistributionRequestsController::class)->defaults('screen', 'create')->middleware('permission:goods_distribution.requests.intake')->name('create');
            Route::get('/{requestId}/edit', ShowDistributionRequestsController::class)->whereUlid('requestId')->defaults('screen', 'edit')->middleware('permission:goods_distribution.requests.intake|goods_distribution.requests.process')->name('edit');
            Route::get('/{requestId}/documents/{checkId}', DownloadDistributionDocumentController::class)->whereUlid('requestId')->whereUlid('checkId')->name('document');
            Route::get('/{requestId}', ShowDistributionRequestsController::class)->whereUlid('requestId')->defaults('screen', 'detail')->name('show');
        });
        Route::prefix('api/goods-distribution/requests')->name('api.')->group(function () {
            Route::post('/cooldown-context', CooldownContextController::class)->name('cooldownLookup');
            Route::get('/{requestId}/cooldown-context', CooldownContextController::class)->whereUlid('requestId')->name('cooldownContext');
            Route::post('/{requestId}/cooldown-exception', [DistributionRequestController::class, 'transition'])->whereUlid('requestId')
                ->defaults('command', 'authorize_cooldown')->middleware('permission:goods_distribution.requests.decide')->name('authorize_cooldown');
            Route::post('/recipients/search', [DistributionRequestController::class, 'lookup'])->defaults('lookup', 'recipients')->name('recipients');
            Route::get('/items', [DistributionRequestController::class, 'lookup'])->defaults('lookup', 'items')->name('items');
            Route::post('/', [DistributionRequestController::class, 'save'])->middleware('permission:goods_distribution.requests.intake')->name('store');
            Route::patch('/{requestId}', [DistributionRequestController::class, 'save'])->whereUlid('requestId')->middleware('permission:goods_distribution.requests.intake|goods_distribution.requests.process')->name('update');
            Route::post('/{requestId}/submit', [DistributionRequestController::class, 'transition'])->whereUlid('requestId')->defaults('command', 'submit')->middleware('permission:goods_distribution.requests.intake|goods_distribution.requests.process')->name('submit');
            Route::post('/{requestId}/sync-household', [DistributionRequestController::class, 'syncHousehold'])->whereUlid('requestId')->middleware('permission:goods_distribution.requests.intake|goods_distribution.requests.process')->name('syncHousehold');
            Route::post('/{requestId}/apply-requirements', [DistributionRequestController::class, 'applyRequirements'])->whereUlid('requestId')->middleware('permission:goods_distribution.requests.intake|goods_distribution.requests.process')->name('applyRequirements');
            foreach (['review' => 'process', 'resubmit' => 'intake', 'approve' => 'decide', 'cancel' => 'decide', 'release' => 'release'] as $command => $ability) {
                Route::post('/{requestId}/'.$command, [DistributionRequestController::class, 'transition'])->whereUlid('requestId')->defaults('command', $command)->middleware('permission:goods_distribution.requests.'.$ability)->name($command);
            }
            Route::post('/{requestId}/return', [DistributionRequestController::class, 'transition'])->whereUlid('requestId')->defaults('command', 'return')->middleware('permission:goods_distribution.requests.process|goods_distribution.requests.decide')->name('return');
            Route::post('/{requestId}/documents/{checkId}/upload', [DistributionRequestController::class, 'document'])->whereUlid('requestId')->whereUlid('checkId')->defaults('upload', true)->name('upload');
            Route::patch('/{requestId}/documents/{checkId}', [DistributionRequestController::class, 'document'])->whereUlid('requestId')->whereUlid('checkId')->middleware('permission:goods_distribution.requests.process')->name('check');
        });
    });

Route::middleware(['auth', 'municipalityContext', 'admin', 'permission:action_center.access'])->name('goodsDistribution.')->group(function () {
    Route::prefix('{municipality}/goods-distribution')->group(function () {
        Route::get('/', ShowGoodsRecipientsController::class)->middleware('permission:action_center.beneficiaries.view')->name('recipients');
        Route::get('/registration/create', ShowGoodsRegistrationController::class)->middleware('permission:action_center.beneficiaries.manage')->name('head.create');
        Route::get('/households/{householdId}/registration', ShowGoodsRegistrationController::class)->middleware('permission:action_center.beneficiaries.manage')->name('member.create');
    });
    Route::prefix('api/goods-distribution')->group(function () {
        Route::post('/identity-check', CheckGoodsRecipientController::class)->middleware('permission:action_center.beneficiaries.view')->name('identity-check');
        Route::post('/households/search', SearchRegistrationHouseholdsController::class)->middleware('permission:action_center.beneficiaries.manage')->name('households.search');
        Route::post('/registration/begin', BeginGoodsRegistrationController::class)->middleware('permission:action_center.beneficiaries.manage')->name('registration.begin');
        Route::post('/registration/head', [StoreGoodsRecipientController::class, 'head'])->middleware('permission:action_center.beneficiaries.manage')->name('head.store');
        Route::post('/households/{householdId}/registration', [StoreGoodsRecipientController::class, 'member'])->middleware('permission:action_center.beneficiaries.manage')->name('member.store');
    });
});

Route::middleware(['auth', 'municipalityContext', 'admin', 'permission:goods_distribution.access', 'permission:goods_distribution.inventory.view'])
    ->name('goodsDistribution.inventory.')->group(function () {
        Route::prefix('{municipality}/goods-distribution')->group(function () {
            Route::get('/inventory', ShowGoodsInventoryController::class)->defaults('screen', 'inventory')->name('index');
            Route::get('/inventory/{itemId}', ShowGoodsInventoryController::class)->defaults('screen', 'item')->name('item');
            Route::get('/items', ShowGoodsInventoryController::class)->defaults('screen', 'catalog')->defaults('catalog', 'items')->name('items');
            Route::get('/programs', ShowGoodsInventoryController::class)->defaults('screen', 'catalog')->defaults('catalog', 'programs')->name('programs');
            Route::get('/programs/{programId}', ShowGoodsInventoryController::class)->whereUlid('programId')->defaults('screen', 'program')->name('programsShow');
            Route::get('/programs/{programId}/stock-receipts/create', ShowGoodsInventoryController::class)->whereUlid('programId')->defaults('screen', 'create')->middleware('permission:goods_distribution.inventory.manage')->name('programsReceiptsCreate');
            Route::get('/programs/{programId}/stock-receipts/{receiptId}/edit', ShowGoodsInventoryController::class)->whereUlid('programId')->defaults('screen', 'edit')->middleware('permission:goods_distribution.inventory.manage')->name('programsReceiptsEdit');
            Route::get('/settings', ShowGoodsInventoryController::class)->defaults('screen', 'settings')->name('settings');
            Route::get('/stock-receipts', ShowGoodsInventoryController::class)->defaults('screen', 'receipts')->name('receipts.index');
            Route::get('/stock-receipts/create', ShowGoodsInventoryController::class)->defaults('screen', 'create')->middleware('permission:goods_distribution.inventory.manage')->name('receipts.create');
            Route::get('/stock-receipts/{receiptId}/edit', ShowGoodsInventoryController::class)->defaults('screen', 'edit')->middleware('permission:goods_distribution.inventory.manage')->name('receipts.edit');
            Route::get('/stock-receipts/{receiptId}', ShowGoodsInventoryController::class)->defaults('screen', 'receipt')->name('receipts.show');
        });
        Route::prefix('api/goods-distribution')->name('api.')->group(function () {
            Route::get('/items/search', [ItemLookupController::class, 'search'])->name('items.search');
            Route::post('/items/check', [ItemLookupController::class, 'check'])->middleware('permission:goods_distribution.inventory.manage')->name('items.check');
            Route::middleware('permission:goods_distribution.inventory.manage')->group(function () {
                Route::patch('/programs/{programId}/cooldown', [InventoryCommandController::class, 'saveProgramCooldown'])->whereUlid('programId')->name('programCooldown');
                Route::put('/programs/{programId}/documents', [DistributionRequestController::class, 'requirements'])->whereUlid('programId')->name('programDocuments');
                Route::post('/programs/{programId}/items/create', [ProgramItemController::class, 'create'])->whereUlid('programId')->defaults('catalog', 'items')->name('programItems.create');
                Route::post('/programs/{programId}/items', [ProgramItemController::class, 'manage'])->whereUlid('programId')->name('programItems.store');
                Route::patch('/programs/{programId}/items/{itemId}', [ProgramItemController::class, 'manage'])->whereUlid('programId')->whereUlid('itemId')->name('programItems.update');
                Route::post('/catalog/{catalog}', [InventoryCommandController::class, 'saveCatalog'])->whereIn('catalog', ['items', 'programs', 'sources', 'locations'])->name('catalog.store');
                Route::patch('/catalog/{catalog}/{recordId}', [InventoryCommandController::class, 'saveCatalog'])->whereIn('catalog', ['items', 'programs', 'sources', 'locations'])->name('catalog.update');
                Route::post('/stock-receipts', [InventoryCommandController::class, 'saveReceipt'])->name('receipts.store');
                Route::post('/programs/{programId}/stock-receipts', [InventoryCommandController::class, 'saveReceipt'])->whereUlid('programId')->name('programsReceiptsStore');
                Route::patch('/programs/{programId}/stock-receipts/{receiptId}', [InventoryCommandController::class, 'saveReceipt'])->whereUlid('programId')->name('programsReceiptsUpdate');
                Route::patch('/stock-receipts/{receiptId}', [InventoryCommandController::class, 'saveReceipt'])->name('receipts.update');
                Route::post('/stock-receipts/{receiptId}/post', [InventoryCommandController::class, 'postReceipt'])->name('receipts.post');
            });
            Route::post('/stock-receipts/{receiptId}/void', [InventoryCommandController::class, 'voidReceipt'])->middleware('permission:goods_distribution.inventory.manage|goods_distribution.inventory.adjust')->name('receipts.void');
            Route::post('/stock-batches/{lineId}/adjustments', [InventoryCommandController::class, 'adjust'])->middleware('permission:goods_distribution.inventory.adjust')->name('adjustments.store');
            Route::post('/stock-movements/{movementId}/reverse', [InventoryCommandController::class, 'reverse'])->middleware('permission:goods_distribution.inventory.adjust')->name('adjustments.reverse');
        });
    });
