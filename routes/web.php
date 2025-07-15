<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Public/HomePage'))->name('homePage');
Route::get('/privacy-policy', fn() => Inertia::render('Public/PrivacyPolicyPage'))->name('privacyPolicyPage');
Route::get('/government', fn() => Inertia::render('Public/GovernmentPage'))->name('governmentPage');
Route::get('/services', fn() => Inertia::render('Public/ServicesPage'))->name('servicesPage');
Route::get('/executive-orders', fn() => Inertia::render('Public/ExecutiveOrdersPage'))->name('executiveOrdersPage');
Route::get('/news-and-events', fn() => Inertia::render('Public/NewsAndEventsPage'))->name('newsAndEventsPage');
Route::get('/transparency', fn() => Inertia::render('Public/TransparencyPage'))->name('transparencyPage');
Route::get('/contact-us', fn() => Inertia::render('Public/ContactUsPage'))->name('contactUsPage');

Route::get('/', fn() => Inertia::render('Public/HomePage'))->name('homePage');
Route::get('/privacy-policy', fn() => Inertia::render('Public/PrivacyPolicyPage'))->name('privacyPolicyPage');
Route::get('/government', fn() => Inertia::render('Public/GovernmentPage'))->name('governmentPage');
Route::get('/services', fn() => Inertia::render('Public/ServicesPage'))->name('servicesPage');
Route::get('/executive-orders', fn() => Inertia::render('Public/ExecutiveOrdersPage'))->name('executiveOrdersPage');
Route::get('/news-and-events', fn() => Inertia::render('Public/NewsAndEventsPage'))->name('newsAndEventsPage');
Route::get('/transparency', fn() => Inertia::render('Public/TransparencyPage'))->name('transparencyPage');
Route::get('/contact-us', fn() => Inertia::render('Public/ContactUsPage'))->name('contactUsPage');
// Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');
Route::get('/business-permit', fn() => Inertia::render('Public/ServiceBusinessPermitPage'))->name('businessPermit');


require __DIR__ . '/auth.php';