<?php

use App\External\Web\Controllers\Public\PublicController;

Route::get('/', [PublicController::class, 'showMainLandingPage'])->name('landingPage.show');
Route::get('/services', [PublicController::class, 'showServicePage'])->name('services.show');
Route::get('/news-events', [PublicController::class, 'showNewsEventsPage'])->name('news.events.show');
Route::get('/government', [PublicController::class, 'showGovernmentPage'])->name('government.show');
Route::get('/{slug}/home', [PublicController::class, 'showHomePage'])->name('home.show');
Route::get('/privacy-policy', [PublicController::class, 'showPrivacyPolicyPage'])->name('privacy.policy.show');
Route::get('/municipal-admin', [PublicController::class, 'showMunicipalAdminPage'])->name('municipal.admin.show');
Route::get('/action-center', [PublicController::class, 'showActionCenterPage'])->name('action.center.show');
Route::get('/action-center/request-list', [PublicController::class, 'showActionCenterRequestPage'])->name('action.center.request.list.show');
Route::get('/my-account', [PublicController::class, 'showMyAccountPage'])->name('my.account.show');
Route::get('/contact-us', [PublicController::class, 'showContactUsPage'])->name('contact.us.show');
Route::get('/travel', [PublicController::class, 'showTravelPage'])->name('travel.page.show');
Route::get('/transparency', [PublicController::class, 'showTransparencyPage'])->name('transparency.show');
Route::get('/executive-orders', [PublicController::class, 'showExecutiveOrdersPage'])->name('executive.order.show');
Route::get('/announcements', [PublicController::class, 'showAnnouncementsPage'])->name('announcements.list.show');
Route::get('/schedule-wedding', [PublicController::class, 'showWeddingPage'])->name('schedule.wedding.show');
