<?php

use App\External\Api\Controllers\SupportTicket\Admin\AcknowledgeTicketController;
use App\External\Api\Controllers\SupportTicket\Admin\CloseTicketController;
use App\External\Api\Controllers\SupportTicket\Admin\ResolveTicketController;
use App\External\Api\Controllers\SupportTicket\Admin\StartTicketProgressController;
use App\External\Api\Controllers\SupportTicket\ReopenTicketController;
use App\External\Api\Controllers\SupportTicket\StoreTicketController;
use App\External\Api\Controllers\SupportTicket\StoreTicketReplyController;
use App\External\Web\Controllers\SupportTicket\Admin\IndexTicketController as AdminIndexTicketController;
use App\External\Web\Controllers\SupportTicket\Admin\ShowTicketController as AdminShowTicketController;
use App\External\Web\Controllers\SupportTicket\Client\CreateTicketController;
use App\External\Web\Controllers\SupportTicket\Client\ListTicketsController;
use App\External\Web\Controllers\SupportTicket\Client\ShowTicketController;
use Illuminate\Support\Facades\Route;

/*
 * Web (Inertia page rendering) — requester-facing (citizen + staff).
 */
Route::prefix('{municipality}/support')
    ->middleware(['municipalityContext', 'auth'])
    ->name('supportTicket.')
    ->group(function () {

        Route::get('/', ListTicketsController::class)->name('index');
        Route::get('/create', CreateTicketController::class)->name('create');
        Route::get('/{support_ticket}', ShowTicketController::class)
            ->whereUlid('support_ticket')
            ->name('show');

    });

/*
 * Web (Inertia page rendering) — admin-facing support queue.
 */
Route::prefix('{municipality}/admin/support')
    ->middleware(['municipalityContext', 'admin', 'permission:support_ticket.access'])
    ->name('supportTicket.admin.')
    ->group(function () {

        Route::get('/', AdminIndexTicketController::class)->name('index');
        Route::get('/{support_ticket}', AdminShowTicketController::class)
            ->whereUlid('support_ticket')
            ->name('show');

    });

/*
 * API (form mutations) — returns Inertia redirects, not JSON.
 */
Route::prefix('api/support')
    ->middleware(['municipalityContext', 'auth'])
    ->name('api.supportTicket.')
    ->group(function () {

        Route::post('/', StoreTicketController::class)->name('store');

        // Thread replies — both requester and staff may post.
        Route::post('/{support_ticket}/replies', StoreTicketReplyController::class)
            ->whereUlid('support_ticket')
            ->name('reply');

        // Requester may reopen their own resolved/closed ticket.
        Route::post('/{support_ticket}/reopen', ReopenTicketController::class)
            ->whereUlid('support_ticket')
            ->name('reopen');

        // Admin Lifecycle Transitions
        Route::middleware(['admin', 'permission:support_ticket.access'])->group(function () {
            Route::post('/{support_ticket}/acknowledge', AcknowledgeTicketController::class)
                ->whereUlid('support_ticket')
                ->name('acknowledge');

            Route::post('/{support_ticket}/start-progress', StartTicketProgressController::class)
                ->whereUlid('support_ticket')
                ->name('start-progress');

            Route::post('/{support_ticket}/resolve', ResolveTicketController::class)
                ->whereUlid('support_ticket')
                ->name('resolve');

            Route::post('/{support_ticket}/close', CloseTicketController::class)
                ->whereUlid('support_ticket')
                ->name('close');
        });

    });
