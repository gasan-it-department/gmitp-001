<?php

namespace App\External\Web\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminDasboardController extends Controller
{
    public function showAdminDashboard()
    {
        return Inertia::render('Admin/Dashboard/AdminDashboard');
    }
}