<?php

use App\External\Web\Controllers\Admin\AdminDasboardController;

Route::prefix('{municipality}/admin')
    ->middleware(['admin', 'municipalityContext'])
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [AdminDasboardController::class, 'showAdminDashboard'])
            ->name('dashboard');

    });
