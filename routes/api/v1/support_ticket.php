<?php

use App\External\Api\Controllers\V1\SupportTicket\ListTicketsController;
use App\External\Api\Controllers\V1\SupportTicket\ReopenTicketController;
use App\External\Api\Controllers\V1\SupportTicket\ShowTicketController;
use App\External\Api\Controllers\V1\SupportTicket\StoreTicketController;
use App\External\Api\Controllers\V1\SupportTicket\StoreTicketReplyController;
use App\External\Api\Controllers\V1\SupportTicket\SubmissionContextController;
use Illuminate\Support\Facades\Route;

Route::prefix('support-tickets')
    ->middleware(['auth:sanctum', 'municipalityContext'])
    ->group(function () {
        Route::get('/submission-context', SubmissionContextController::class);
        Route::get('/', ListTicketsController::class);
        Route::post('/', StoreTicketController::class);

        Route::get('/{support_ticket}', ShowTicketController::class)
            ->whereUlid('support_ticket');
        Route::post('/{support_ticket}/replies', StoreTicketReplyController::class)
            ->whereUlid('support_ticket');
        Route::post('/{support_ticket}/reopen', ReopenTicketController::class)
            ->whereUlid('support_ticket');
    });
