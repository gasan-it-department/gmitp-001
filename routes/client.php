<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/client-home', fn() => Inertia::render('Client/Home/ClientHomePage'))->name('client.home.show');
