<?php

use App\External\Web\Controllers\Public\PublicController;

Route::get('/', [PublicController::class, 'showMainLandingPage'])->name('landingPage.show');
//this is the issue

Route::get('/', [PublicController::class, 'showHomePage'])->name('home.show');
Route::get('/services', [PublicController::class, 'showServicePage'])->name('services.show');
Route::get('/contact-us', [PublicController::class, 'showContactUsPage'])->name('contact.us.show');
Route::get('/news-events', [PublicController::class, 'showNewsEventsPage'])->name('news.events.show');
Route::get('/government', [PublicController::class, 'showGovernmentPage'])->name('government.show');

