<?php

use App\External\Web\Controllers\Public\PublicController;

Route::prefix('{municipality}')
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
        Route::get('/executive-orders', [PublicController::class, 'showExecutiveOrdersPage'])->name('executiveOrders');
        Route::get('/all-announcements', [PublicController::class, 'showAllAnnouncementPage'])->name('announcements');
        Route::get('/all-events', [PublicController::class, 'showAllEventsPage'])->name('events');
        Route::get('/schedule-wedding', [PublicController::class, 'showWeddingPage'])->name('wedding');
    });

Route::get('/', [PublicController::class, 'showMainLandingPage'])->name('landing');
