<?php

use App\External\Api\Controllers\V1\Tourism\ListTourismController;
use Illuminate\Support\Facades\Route;

Route::middleware('municipalityContext')
    ->get('/tourism', ListTourismController::class);
