<?php

use App\External\Web\Controllers\Transaction\TransactionController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/transaction')
    ->middleware(['municipalityContext', 'auth'])
    ->name('transaction.')
    ->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
    });

