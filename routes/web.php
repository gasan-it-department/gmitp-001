<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Domains\Auth\Controllers\UserController;

Route::get('/', fn() => Inertia::render('Classes/HomePage'))->name('homePage');
Route::get('/privacy-policy', fn() => Inertia::render('Classes/PrivacyPolicy'))->name('privacyPolicy');

Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');

