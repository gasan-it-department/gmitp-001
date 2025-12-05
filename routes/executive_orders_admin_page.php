<?php

use App\External\Web\Controllers\LocalGovernment\ExecutiveOrdersController;

Route::prefix('{municipality}/executive-orders-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('executiveOrders.')
    ->controller(ExecutiveOrdersController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });