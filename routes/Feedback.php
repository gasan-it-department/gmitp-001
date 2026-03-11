<?php
use App\External\Web\Controllers\Feedback\Admin\FeedbackAdminController;
use App\External\Web\Controllers\Feedback\Client\ListFeedbackController;
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Feedback\FeedbackController;


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

    });


Route::prefix('api/feedback')
    ->middleware(['municipalityContext', 'auth'])
    ->as('feedback.')
    ->controller(FeedbackController::class)
    ->group(function () {


        Route::middleware(['admin', 'auth'])
            ->group(function () {

                Route::get('/', 'fetch')->name('fetch');

                Route::get('{id}', 'show')->name('show');

                Route::put('{id}', 'update')->name('update');

                Route::delete('{id}', 'destroy')->name('destroy');

            });

        Route::post('/', 'store')->name('store');

    });
