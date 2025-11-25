<?php

use App\External\Web\Controllers\Public\PublicController;

Route::prefix('{municipality}') // treated as string
    ->middleware('municipalityContext')
    ->group(function () {
        // Route::get('/services', [PublicController::class, 'showServicePage'])->name('services');
        Route::get('/home', [PublicController::class, 'showHomePage'])->name('home');
        Route::get('/privacy-policy', [PublicController::class, 'showPrivacyPolicyPage'])->name('privacy');
        Route::get('/government', [PublicController::class, 'showGovernmentPage'])->name('government');
        Route::get('/municipal-admin', [PublicController::class, 'showMunicipalAdminPage'])->name('admin');
        Route::get('/action-center/create', [PublicController::class, 'showActionCenterPage'])->name('actionCenter');
        Route::get('/action-center/request-list', [PublicController::class, 'showActionCenterRequestPage'])->name('requests');
        Route::get('/my-account', [PublicController::class, 'showMyAccountPage'])->name('account');
        Route::get('/contact-us', [PublicController::class, 'showContactUsPage'])->name('contact');
        Route::get('/travel', [PublicController::class, 'showTravelPage'])->name('travel');
        Route::get('/transparency', [PublicController::class, 'showTransparencyPage'])->name('transparency');
        Route::get('/executive-orders', [PublicController::class, 'showExecutiveOrdersPage'])->name('orders');
        Route::get('/announcements', [PublicController::class, 'showAnnouncementsPage'])->name('announcements');
        Route::get('/schedule-wedding', [PublicController::class, 'showWeddingPage'])->name('wedding');
    });

Route::get('/', [PublicController::class, 'showMainLandingPage'])->name('landing');
