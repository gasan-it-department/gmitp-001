<?php

use App\External\Web\Controllers\Public\PublicController;

Route::get('/', [PublicController::class, 'showMainLandingPage'])->name('landingPage.show');
Route::get('/services', [PublicController::class, 'showServicePage'])->name('services.show');
Route::get('/contact-us', [PublicController::class, 'showContactUsPage'])->name('contact.us.show');
Route::get('/news-events', [PublicController::class, 'showNewsEventsPage'])->name('news.events.show');
Route::get('/government', [PublicController::class, 'showGovernmentPage'])->name('government.show');
Route::get('/home', [PublicController::class, 'showHomePage'])->name('home.show');
Route::get('/privacy-policy', [PublicController::class, 'showPrivacyPolicyPage'])->name('privacy.policy.show');
Route::get('/municipal-admin', [PublicController::class, 'showMunicipalAdminPage'])->name('municipal.admin.show');
Route::get('/action-center', [PublicController::class, 'showActionCenterPage'])->name('action.center.show');
Route::get('/action-center/request-list', [PublicController::class, 'showActionCenterRequestPage'])->name('action.center.request.list.show');
