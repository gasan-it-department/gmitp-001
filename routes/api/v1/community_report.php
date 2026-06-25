<?php
use App\External\Api\Controllers\V1\CommunityReport\SubmissionContextController;
use App\External\Api\Controllers\V1\CommunityReport\StoreReportController;
use Illuminate\Support\Facades\Route;


Route::prefix('community-reports')
    ->middleware(['auth:sanctum', 'municipalityContext'])
    ->group(function () {
        Route::get('/submission-context', SubmissionContextController::class);
        // Route::get('/', '');
        Route::post('/', StoreReportController::class);
    
        // Route::get('/{report}', '')
        //     ->whereUlid('report');
    });
