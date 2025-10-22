<?php
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Feedback\FeedbackController;

Route::prefix('feedback')
    ->name('feedback')
    ->group(function () {

        Route::get('/', [FeedbackController::class, 'index'])->name('index');
        Route::post('/', [FeedbackController::class, 'store'])->name('store');
        Route::get('{id}', [FeedbackController::class, 'show'])->name('show');
        Route::put('{id}', [FeedbackController::class, 'update'])->name('update');
        Route::delete('{id}', [FeedbackController::class, 'destroy'])->name('destroy');

        //testing
    

    });

