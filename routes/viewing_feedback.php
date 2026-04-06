<?php

use App\External\Web\Controllers\Feedback\Admin\FeedbackAdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/view-feedback')
    ->middleware(['municipalityContext', 'admin'])
    ->name('viewFeedback.')
    ->controller(FeedbackAdminController::class)
    ->group(function () {

        Route::get('/admin', 'showViewingFeedback')->name('page');

    });

