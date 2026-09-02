<?php

use App\External\Api\Controllers\Auth\ForgotPasswordController;
use App\External\Api\Controllers\Auth\Login\AuthenticateSocialUserController;
use App\External\Api\Controllers\Auth\Login\AuthenticateSupabaseSessionController;
use App\External\Api\Controllers\Auth\LoginController;
use App\External\Api\Controllers\Auth\LogoutController;
use App\External\Api\Controllers\Auth\ResetPasswordController;
use App\External\Api\Controllers\Auth\Signup\CreateUserController;
use App\External\Api\Controllers\Auth\UpdatePasswordController;
use App\External\Api\Controllers\Auth\UpdatePhoneController;
use App\External\Api\Controllers\Auth\VerifiyPhoneController;
use App\External\Api\Controllers\Profile\LinkSocialAccountController;
use App\External\Api\Controllers\UserManagement\CreateAdminController;
use App\External\Api\Controllers\UserManagement\DeactivateAdminController;
use App\External\Api\Controllers\UserManagement\ReactivateAdminController;
use App\External\Api\Controllers\UserManagement\UpdateAdminProfileController;
use App\External\Web\Controllers\Auth\AuthController;
use App\External\Web\Controllers\Auth\ForgotPasswordViewController;
use App\External\Web\Controllers\Auth\ShowLoginController;
use App\External\Web\Controllers\Auth\ShowSignupController;
use App\External\Web\Controllers\SuperAdmin\SuperAdminController;
use App\External\Web\Controllers\UserManagement\Public\ShowUserProfileController;
use App\External\Web\Controllers\UserManagement\SuperAdmin\EditAdminController;
use App\External\Web\Controllers\UserManagement\SuperAdmin\ListUserManagementController;
use App\External\Web\Controllers\UserManagement\SuperAdmin\UserManagementController;
use Illuminate\Support\Facades\Route;

// for unauthenticated users
Route::prefix('api/auth')
    ->middleware(['guest'])
    ->group(function () {
        // api
        Route::post('/store-account', CreateUserController::class)
            ->name('user.store')
            ->middleware(['municipalityContext']);

        Route::post('/login', LoginController::class)
            ->name('login')
            ->middleware('municipalityContext');

        Route::post('/social', AuthenticateSocialUserController::class)
            ->name('login.social')
            ->middleware('municipalityContext');

        Route::post('/supabase/session', AuthenticateSupabaseSessionController::class)
            ->name('login.supabase.session')
            ->middleware(['municipalityContext', 'throttle:10,1']);

    });

// Authenticated profile actions
Route::prefix('api/profile')
    ->middleware(['auth'])
    ->group(function () {
        Route::post('/social/link', LinkSocialAccountController::class)
            ->name('profile.social.link');
    });

// Basically for auth related pls read the URI and NAMES
Route::middleware('auth')->group(function () {
    Route::get('{municipality}/profile', ShowUserProfileController::class)->name('profile.show')->middleware('municipalityContext');

    Route::post('/logout', LogoutController::class)->name('logout');

    // Updating the password Via profile
    Route::put('/password/update', UpdatePasswordController::class)->name('password.change');

});

// CRITICAL: for forgot password routings (if any issue ask harvey)
Route::middleware(['guest'])
    ->group(function () {
        Route::get('{municipality}/login', ShowLoginController::class)->name('login.page')->middleware('municipalityContext');

        Route::get('{municipality}/sign-up', ShowSignupController::class)->name('signup.show')->middleware('municipalityContext');
        //
        Route::get('/forgot-password', [ForgotPasswordViewController::class, 'index'])->name('password.request');

        Route::post('/forgot-password', [ForgotPasswordController::class, 'requestPassword'])->name('password.phone');

        // for forgot password otp
        Route::get('/forgot-password/verify', [ForgotPasswordViewController::class, 'showOtpForm'])->name('password.otp.verify');

        Route::post('/forgot-password/verify', [ForgotPasswordController::class, 'verifyForgetPasswordOtp'])->name('password.otp.submit');

        Route::get('/reset-password/{phone}', [ForgotPasswordViewController::class, 'showResetForm'])->name('password.reset.form')->middleware('signed');

        Route::post('/reset-password/{phone}', [ResetPasswordController::class, 'update'])
            ->name('password.update')
            ->middleware('signed');
    });

Route::prefix('{municipality}')
    ->middleware(['auth', 'municipalityContext', 'phone.pending'])
    ->group(function () {
        Route::get('/otp', [AuthController::class, 'showOtpPage'])->name('otp.verification.page');

        Route::post('/verify', [VerifiyPhoneController::class, 'verify'])->name('verify');

        Route::post('/resend-otp', [VerifiyPhoneController::class, 'resendOtp'])->name('resend.otp');

        Route::put('/update/phone-number', [UpdatePhoneController::class, 'update'])->name('update.phone');
    });

// super admin user management
Route::middleware('superAdmin')
    ->prefix('super-admin')
    ->as('superAdmin.')
    ->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'showDashboard'])
            ->name('dashboard');

        Route::get('/user-management', ListUserManagementController::class)
            ->name('users.page');

        Route::get('/user-registry', [UserManagementController::class, 'register'])->name('registry.page');

        Route::get('/user-view/{id}', [UserManagementController::class, 'show'])->name('show.user');

        Route::get('/user-edit/{id}', EditAdminController::class)->name('users.edit');

    });

Route::prefix('api/user-management')
    ->name('user.management.')
    ->middleware(['superAdmin', 'auth'])
    ->group(function () {
        // Invokable controller. Resulting name: 'user.management.createAdmin'
        Route::post('/create-admin', CreateAdminController::class)->name('createAdmin');

        // Invokable controller. Resulting name: 'user.management.updateAdmin'
        Route::put('/update-admin/{id}', UpdateAdminProfileController::class)->name('updateAdmin');

        // Offboarding. Resulting names: 'user.management.deactivateAdmin' / '...reactivateAdmin'
        Route::put('/deactivate-admin/{id}', DeactivateAdminController::class)->name('deactivateAdmin');
        Route::put('/reactivate-admin/{id}', ReactivateAdminController::class)->name('reactivateAdmin');
    });
