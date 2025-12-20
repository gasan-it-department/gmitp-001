<?php

use App\External\Api\Controllers\Auth\CreateAdminController;
use Illuminate\Support\Facades\Route;
use App\External\Api\Controllers\Auth\CreateUserController;
use App\External\Api\Controllers\Auth\AuthenticateUserController;
use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use App\External\Web\Controllers\UserManagement\SuperAdmin\UserManagementController;

Route::prefix('api/auth')
    ->middleware(['guest', 'municipalityContext'])
    ->group(function () {
        //api
        Route::post('/store-account', [CreateUserController::class, 'createUser'])->name('user.store');
        Route::post('/login', [AuthenticateUserController::class, 'login'])
            ->name('login')
            ->middleware('municipalityContext');

    });

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthenticateUserController::class, 'logout'])->name('logout');

});

//super admin user management
Route::middleware('superAdmin')
    ->prefix('super-admin')
    ->as('superAdmin.')
    ->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'showDashboard'])
            ->name('dashboard');

        Route::get('/user-management', [UserManagementController::class, 'index'])
            ->name('users.page');

        Route::get('/user-registry', [UserManagementController::class, 'register'])->name('registry.page');
    });

Route::prefix('api/user-management')
    ->name('user.management.')
    ->middleware(['superAdmin', 'auth:sanctum'])
    ->controller(CreateAdminController::class)
    ->group(function () {
        // Resulting Name: 'user.management.createAdmin'
        Route::post('/create-admin', 'store')->name('createAdmin');
    });
