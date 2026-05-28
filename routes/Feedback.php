<?php
use App\External\Web\Controllers\Feedback\Admin\FeedbackAdminController;
use App\External\Web\Controllers\Feedback\Client\CreateFeedbackController;
use App\External\Web\Controllers\Feedback\Client\ListFeedbackController;
use App\External\Api\Controllers\Feedback\FetchFeedbackController;
use App\External\Api\Controllers\Feedback\StoreFeedbackController;
use Illuminate\Support\Facades\Route;


//eg. https://gasan-4905/feedback/
Route::prefix('{municipality}')
    ->middleware(['municipalityContext', 'admin'])
    ->group(function () {

        // ADMIN DASHBOARD (web page)
        Route::middleware('admin')
            ->prefix('feedback')
            ->name('feedback.admin.')
            ->controller(FeedbackAdminController::class)
            ->group(function () {

            Route::get('/admin', 'index')->name('index');

            Route::get('/show/{id}', 'show')->name('show');

        });

    });

//client side route page.
Route::prefix('{municipality}/feedback/client')
    ->middleware(['municipalityContext', 'auth'])
    ->group(function () {

        Route::get('/', ListFeedbackController::class)->name('list');
        Route::get('/create', CreateFeedbackController::class)->name('create');

    });


Route::prefix('api/feedback')
    ->middleware(['municipalityContext', 'auth'])
    ->as('feedback.')
    ->group(function () {


        Route::middleware(['admin', 'auth'])
            ->group(function () {

                Route::get('/', FetchFeedbackController::class)->name('fetch');

            });

        Route::post('/', StoreFeedbackController::class)->name('store');

    });
