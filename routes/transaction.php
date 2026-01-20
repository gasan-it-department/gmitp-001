<?php

use App\External\Web\Controllers\Transaction\TransactionController;

Route::prefix('{municipality}/transaction')
    ->middleware(['municipalityContext', 'auth'])
    ->name('transaction.')
    ->group(function () {

        Route::get('/', [TransactionController::class, 'index'])->name('index');


    });

