<?php

use App\External\Api\Controllers\Auth\ResetPasswordController;
use App\External\Api\Controllers\Auth\UpdatePhoneController;
use Illuminate\Support\Facades\Route;
use App\External\Web\Controllers\Auth\AuthController;
use App\External\Api\Controllers\Auth\CreateUserController;
use App\External\Api\Controllers\Auth\CreateAdminController;
use App\External\Api\Controllers\Auth\VerifiyPhoneController;
use App\External\Api\Controllers\Auth\ForgotPasswordController;
use App\External\Api\Controllers\Auth\AuthenticateUserController;
use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use App\External\Web\Controllers\Auth\ForgotPasswordViewController;
use App\External\Web\Controllers\UserManagement\SuperAdmin\UserManagementController;


//for unauthenticated users
Route::prefix('api/auth')
    ->middleware(['guest'])
    ->group(function () {
        //api
        Route::post('/store-account', [CreateUserController::class, 'createUser'])
            ->name('user.store')
            ->middleware(['municipalityContext']);

        Route::post('/login', [AuthenticateUserController::class, 'login'])
            ->name('login')
            ->middleware('municipalityContext');


    });


// Basically for auth related pls read the URI and NAMES    
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthenticateUserController::class, 'logout'])->name('logout');

    Route::post('/verify', [VerifiyPhoneController::class, 'verify'])->name('verify');

    Route::post('/resend-otp', [VerifiyPhoneController::class, 'resendOtp'])->name('resend.otp');

    Route::get('otp', [AuthController::class, 'showOtpPage'])->name('otp.verification.page');

    Route::put('/update/phone-number', [UpdatePhoneController::class, 'update'])->name('update.phone');

});


//CRITICAL: for forgot password routings (if any issue ask harvey)
Route::middleware(['guest'])
    ->group(function () {

        //
        Route::get('/forgot-password', [ForgotPasswordViewController::class, 'index'])->name('password.request');

        Route::post('/forgot-password', [ForgotPasswordController::class, 'requestPassword'])->name('password.phone');

        //for forgot password otp
        Route::get('/forgot-password/verify', [ForgotPasswordViewController::class, 'showOtpForm'])->name('password.otp.verify');

        Route::post('/forgot-password/verify', [ForgotPasswordController::class, 'verifyForgetPasswordOtp'])->name('password.otp.submit');

        Route::get('/reset-password/{phone}', [ForgotPasswordViewController::class, 'showResetForm'])->name('password.reset.form')->middleware('signed');

        Route::post('/reset-password/{phone}', [ResetPasswordController::class, 'update'])
            ->name('password.update')
            ->middleware('signed');
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

        Route::get('/user-view/{id}', [UserManagementController::class, 'show'])->name('show.user');

    });

Route::prefix('api/user-management')
    ->name('user.management.')
    ->middleware(['superAdmin', 'auth:sanctum'])
    ->controller(CreateAdminController::class)
    ->group(function () {
        // Resulting Name: 'user.management.createAdmin'
        Route::post('/create-admin', 'store')->name('createAdmin');
    });
