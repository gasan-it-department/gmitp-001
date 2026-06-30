<?php

use App\External\Api\Controllers\V1\Announcement\ListAnnouncementsController;
use App\External\Api\Controllers\V1\Announcement\ShowAnnouncementController;
use Illuminate\Support\Facades\Route;

Route::prefix('announcements')
    ->middleware('municipalityContext')
    ->group(function () {
        Route::get('/', ListAnnouncementsController::class);

        Route::get('/{announcement}', ShowAnnouncementController::class)
            ->whereUlid('announcement');
    });
