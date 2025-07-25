<?php

use App\Domains\Public\Controllers\PublicPagesController;

Route::get('/', [PublicPagesController::class, 'showHomePage'])->name('home.show');
Route::get('/services', [PublicPagesController::class, 'showServicePage'])->name('services.show');
Route::get('/contact-us', [PublicPagesController::class, 'showContactUsPage'])->name('contact.us.show');
Route::get('/news-events', [PublicPagesController::class, 'showNewsEventsPage'])->name('news.events.show');
Route::get('/government', [PublicPagesController::class, 'showGovernmentPage'])->name('government.show');


