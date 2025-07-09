<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PageController;

Route::get('/', fn () => Inertia::render('Classes/HomePage'))->name('homePage');
Route::get('/privacy-policy', fn () => Inertia::render('Classes/PrivacyPolicy'))->name('privacyPolicy');
Route::get('/government', fn () => Inertia::render('Classes/GovernmentPage'))->name('governmentPage');
Route::get('/services', fn () => Inertia::render('Classes/Services'))->name('services');
Route::get('/executive-orders', fn () => Inertia::render('Classes/ExecutiveOrders'))->name('executiveOrders');
Route::get('/news-and-events', fn () => Inertia::render('Classes/NewsAndEventsPage'))->name('newsAndEventsPage');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
