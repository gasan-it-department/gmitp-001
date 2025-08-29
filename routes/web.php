<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

Route::get('/privacy-policy', fn() => Inertia::render('Public/PrivacyPolicyPage'))->name('privacyPolicyPage');
Route::get('/executive-orders', fn() => Inertia::render('Public/ExecutiveOrdersPage'))->name('executiveOrdersPage');
Route::get('/news-and-events', fn() => Inertia::render('Public/NewsAndEventsPage'))->name('newsAndEventsPage');
Route::get('/transparency', fn() => Inertia::render('Public/TransparencyPage'))->name('transparencyPage');
Route::get('/business-permit', fn() => Inertia::render('Public/BusinessPermitAndLicensing'))->name('businessPermit');

require __DIR__ . '/auth.php';
require __DIR__ . '/public.php';
require __DIR__ . '/client.php';