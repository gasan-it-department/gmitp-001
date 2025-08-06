<?php

use App\External\Web\Controllers\Public\PublicController;

Route::get('/', [PublicPagesController::class, 'showMainLandingPage'])->name('landingPage.show');
Route::get('/services', [PublicPagesController::class, 'showServicePage'])->name('services.show');
Route::get('/contact-us', [PublicPagesController::class, 'showContactUsPage'])->name('contact.us.show');
Route::get('/news-events', [PublicPagesController::class, 'showNewsEventsPage'])->name('news.events.show');
Route::get('/government', [PublicPagesController::class, 'showGovernmentPage'])->name('government.show');
Route::get('/home', [PublicPagesController::class, 'showHomePage'])->name('home.show');
Route::get('/privacy-policy', [PublicPagesController::class, 'showPrivacyPolicyPage'])->name('privacy.policy.show');
Route::get('/municipal-admin', [PublicPagesController::class, 'showMunicipalAdminPage'])->name('municipal.admin.show');
Route::get('/action-center', [PublicPagesController::class, 'showActionCenterPage'])->name('action.center.show');

Route::get('/', [PublicController::class, 'showMainLandingPage'])->name('landingPage.show');
//this is the issue

Route::get('/', [PublicController::class, 'showHomePage'])->name('home.show');
Route::get('/services', [PublicController::class, 'showServicePage'])->name('services.show');
Route::get('/contact-us', [PublicController::class, 'showContactUsPage'])->name('contact.us.show');
Route::get('/news-events', [PublicController::class, 'showNewsEventsPage'])->name('news.events.show');
Route::get('/government', [PublicController::class, 'showGovernmentPage'])->name('government.show');

