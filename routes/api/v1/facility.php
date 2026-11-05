<?php

use App\External\Api\Controllers\V1\Facility\ListFacilitiesController;
use App\External\Api\Controllers\V1\Facility\ShowFacilityController;
use Illuminate\Support\Facades\Route;

Route::prefix('facilities')
    ->middleware('municipalityContext')
    ->name('api.v1.facilities.')
    ->group(function () {
        Route::get('/', ListFacilitiesController::class)->name('index');
        Route::get('/{facility}', ShowFacilityController::class)
            ->whereUlid('facility')
            ->name('show');
    });
