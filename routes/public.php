<?php

use App\Http\Controllers\Public\PublicPagesController;

Route::get('/', [PublicPagesController::class, 'showHomePage'])->name('home.show');
Route::get('/services', [PublicPagesController::class, 'showServicePage'])->name('services.show');
Route::get('/contact-us', [PublicPagesController::class, 'showContactUsPage'])->name('contact.us.show');
