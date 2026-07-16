<?php

use App\External\Api\Controllers\Feedback\FetchFeedbackController;
use App\External\Api\Controllers\Feedback\StoreFeedbackController;
use App\External\Web\Controllers\Feedback\Admin\FeedbackAdminController;
use App\External\Web\Controllers\Feedback\Admin\ShowFeedbackDetailsController;
use App\External\Web\Controllers\Feedback\Client\CreateFeedbackController;
use App\External\Web\Controllers\Feedback\Client\DepartmentRatingsController;
use App\External\Web\Controllers\Feedback\Client\ListFeedbackController;
use App\External\Web\Controllers\Feedback\Client\ShowFeedbackController;
use Illuminate\Support\Facades\Route;

//eg. https://gasan-4905/feedback/
Route::prefix('{municipality}')
    ->middleware(['municipalityContext', 'admin', 'permission:feedback.access'])
    ->group(function () {

        // ADMIN DASHBOARD (web page)
        Route::middleware('admin')
            ->prefix('feedback')
            ->name('feedback.admin.')
            ->group(function () {

                Route::get('/admin', [FeedbackAdminController::class, 'index'])->name('index');

                Route::get('/show/{feedback}', ShowFeedbackDetailsController::class)->name('show');

            });

    });

//client side route page.
Route::prefix('{municipality}/feedback/client')
    ->name('feedback.')
    ->middleware(['municipalityContext'])
    ->group(function () {

        Route::get('/create', CreateFeedbackController::class)->name('create');
        Route::get('/department-ratings', DepartmentRatingsController::class)->name('department-ratings');

        Route::middleware('auth')->group(function () {
            Route::get('/', ListFeedbackController::class)->name('list');
            Route::get('/show/{feedback}', ShowFeedbackController::class)->name('show');
        });

    });

Route::prefix('api/feedback')
    ->middleware(['municipalityContext'])
    ->as('api.feedback.')
    ->group(function () {


        Route::middleware(['admin', 'auth', 'permission:feedback.access'])->group(function () {
            Route::get('/', FetchFeedbackController::class)->name('fetch');
        });

        Route::post('/store', StoreFeedbackController::class)
            ->middleware('throttle:3,1')
            ->name('store');

    });
