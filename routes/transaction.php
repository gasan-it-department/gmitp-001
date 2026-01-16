<?php

use App\External\Web\Controllers\Transaction\TransactionController;

Route::prefix('{municipality}/transaction')
    ->middleware(['auth:sanctum', 'municipalityContext'])
    ->name('transaction.')
    ->group(function () {

        Route::get('/', [TransactionController::class, 'index'])->name('index');


    });

