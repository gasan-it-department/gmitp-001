<?php
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Feedback\FeedbackController;

Route::prefix('api/feedback')
    ->middleware(['municipalityContext'])
    ->name('feedback.')
    ->controller(FeedbackController::class)
    ->group(function () {


        Route::middleware(['admin'])
            ->prefix('admin')
            ->group(function () {

                Route::get('{id}', 'show')->name('show');

                Route::put('{id}', 'update')->name('update');

                Route::delete('{id}', 'destroy')->name('destroy');

                Route::get('/', 'fetch')->name('fetch');
            });

        Route::post('/', 'store')->name('store');

    });

