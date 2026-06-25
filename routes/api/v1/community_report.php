<?php
use App\External\Api\Controllers\V1\CommunityReport\SubmissionContextController;
use Illuminate\Support\Facades\Route;


Route::prefix('community-reports')
    ->middleware(['auth:sanctum', 'municipalityContext'])
    ->group(function () {
        Route::get('/submission-context', SubmissionContextController::class);
        // Route::get('/', '');
        // Route::post('/', '');
    
        // Route::get('/{report}', '')
        //     ->whereUlid('report');
    });