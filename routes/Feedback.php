<?php
use App\External\Web\Controllers\Feedback\Admin\FeedbackAdminController;
use App\External\Web\Controllers\Feedback\Client\CreateFeedbackController;
use App\External\Web\Controllers\Feedback\Client\ListFeedbackController;
use App\External\Web\Controllers\Feedback\Client\ShowFeedbackController;
use App\External\Api\Controllers\Feedback\FetchFeedbackController;
use App\External\Api\Controllers\Feedback\StoreFeedbackController;
use Illuminate\Support\Facades\Route;


//eg. https://gasan-4905/feedback/
Route::prefix('{municipality}')
    ->middleware(['municipalityContext', 'admin', 'permission:feedback.access'])
    ->group(function () {

        // ADMIN DASHBOARD (web page)
        Route::middleware('admin')
            ->prefix('feedback')
            ->name('feedback.admin.')
            ->controller(FeedbackAdminController::class)
            ->group(function () {

            Route::get('/admin', 'index')->name('index');

            Route::get('/show/{feedback}', 'show')->name('show');

        });

    });

//client side route page.
Route::prefix('{municipality}/feedback/client')
    ->name('feedback.')
    ->middleware(['municipalityContext', 'auth'])
    ->group(function () {

        Route::get('/', ListFeedbackController::class)->name('list');
        Route::get('/create', CreateFeedbackController::class)->name('create');
        Route::get('/show/{feedback}', ShowFeedbackController::class)->name('show');

    });


Route::prefix('api/feedback')
    ->middleware(['municipalityContext', 'auth'])
    ->as('api.feedback.')
    ->group(function () {


        Route::middleware(['admin', 'auth', 'permission:feedback.access'])
            ->group(function () {

                Route::get('/', FetchFeedbackController::class)->name('fetch');

            });

        Route::post('/store', StoreFeedbackController::class)->name('store');

    });
