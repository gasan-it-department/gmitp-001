<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PageController;

Route::get('/', fn () => Inertia::render('Classes/HomePage'))->name('homePage');
Route::get('/privacy-policy', fn () => Inertia::render('Classes/PrivacyPolicyPage'))->name('privacyPolicyPage');
Route::get('/government', fn () => Inertia::render('Classes/GovernmentPage'))->name('governmentPage');
Route::get('/services', fn () => Inertia::render('Classes/ServicesPage'))->name('servicesPage');
Route::get('/executive-orders', fn () => Inertia::render('Classes/ExecutiveOrdersPage'))->name('executiveOrdersPage');
Route::get('/news-and-events', fn () => Inertia::render('Classes/NewsAndEventsPage'))->name('newsAndEventsPage');
Route::get('/transparency', fn () => Inertia::render('Classes/TransparencyPage'))->name('transparencyPage');
Route::get('/contact-us', fn () => Inertia::render('Classes/ContactUsPage'))->name('contactUsPage');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
