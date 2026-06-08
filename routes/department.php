<?php

use App\External\Api\Controllers\Department\StoreDepartmentController;
use App\External\Api\Controllers\Department\ToggleDepartmentStatusController;
use App\External\Api\Controllers\Department\UpdateDepartmentController;
use App\External\Web\Controllers\Department\CreateDepartmentController;
use App\External\Web\Controllers\Department\EditDepartmentController;
use App\External\Web\Controllers\Department\IndexDepartmentController;
use App\External\Web\Controllers\Department\ShowDepartmentController;
use Illuminate\Support\Facades\Route;

// WEB — Inertia pages
Route::prefix('{municipality}/department')
    ->middleware(['municipalityContext', 'auth', 'admin', 'permission:department.access'])
    ->name('department.')
    ->group(function () {
        Route::get('/', IndexDepartmentController::class)->name('index');
        Route::get('/create', CreateDepartmentController::class)->name('create');
        Route::get('/show/{department}', ShowDepartmentController::class)->name('show');
        Route::get('/edit/{department}', EditDepartmentController::class)->name('edit');
    });

// API — mutations (Inertia redirects)
Route::prefix('api/department')
    ->middleware(['municipalityContext', 'auth', 'admin', 'permission:department.access'])
    ->name('api.department.')
    ->group(function () {
        Route::post('/store', StoreDepartmentController::class)->name('store');
        Route::patch('/update/{department}', UpdateDepartmentController::class)->name('update');
        Route::patch('/toggle-status/{department}', ToggleDepartmentStatusController::class)->name('toggle-status');
    });
