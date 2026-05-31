<?php


use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('test/test', fn() => Inertia::render('Event/Event'))->name('form.sample');

require __DIR__ . '/auth.php';
require __DIR__ . '/public.php';
require __DIR__ . '/client.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/action_center.php';
require __DIR__ . '/municipality.php';
require __DIR__ . '/Feedback.php';
require __DIR__ . '/super_admin.php';
require __DIR__ . '/communityReport.php';
require __DIR__ . '/viewing_feedback.php';
require __DIR__ . '/travel_editor_page.php';
require __DIR__ . '/procurement.php';
require __DIR__ . '/transaction.php';
require __DIR__ . '/cemetery.php';
require __DIR__ . '/government.php';
require __DIR__ . '/department.php';
require __DIR__ . '/tourism.php';
require __DIR__ . '/announcement.php';
require __DIR__ . '/event.php';








