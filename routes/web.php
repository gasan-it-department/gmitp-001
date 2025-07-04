<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PageController;

Route::get('/', fn () => Inertia::render('Classes/HomePage'))->name('homePage');
Route::get('/privacy-policy', fn () => Inertia::render('Classes/PrivacyPolicy'))->name('privacyPolicy');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
