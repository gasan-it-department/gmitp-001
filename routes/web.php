<?php
use Inertia\Inertia;

// use Illuminate\Support\Facades\Route;
// use Inertia\Inertia;
// use Illuminate\Http\Request;
Route::get('feedback-form-testing', function () {
    return Inertia::render('Feedback/FeedbackFormTrial');
});


require __DIR__ . '/auth.php';
require __DIR__ . '/public.php';
require __DIR__ . '/client.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/actionCenter/action_center.php';
require __DIR__ . '/superAdmin.php';
require __DIR__ . '/Feedback.php';

