<?php

use App\External\Api\Controllers\V1\Event\ListEventsController;
use App\External\Api\Controllers\V1\Event\ShowEventController;
use Illuminate\Support\Facades\Route;

Route::prefix('events')
    ->middleware('municipalityContext')
    ->group(function () {
        Route::get('/', ListEventsController::class);

        Route::get('/{event}', ShowEventController::class)
            ->whereUlid('event');
    });
