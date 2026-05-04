<?php

use App\External\Web\Controllers\Admin\AdminDasboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/admin')
    ->middleware(['municipalityContext', 'admin'])
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [AdminDasboardController::class, 'showAdminDashboard'])
            ->name('dashboard');

    });
