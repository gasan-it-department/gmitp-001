<?php

namespace App\External\Web\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminDasboardController extends Controller
{
    public function showAdminDashboard()
    {
        return Inertia::render('ActionCenter/Admin/Dashboard/AdminDashboard');
    }

    // TESTING PURPOSES ONLY
    public function showFeedbackPage()
    {
        return Inertia::render('BulletinBoard/Admin/FeedbackPage');
    }
}