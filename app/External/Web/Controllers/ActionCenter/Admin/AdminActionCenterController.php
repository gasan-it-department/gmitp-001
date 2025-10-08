<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class AdminActionCenterController extends Controller
{
    public function showAdminActionCenterPage()
    {
        return Inertia::render('ActionCenter/Admin/RequestList/ActionCenterRequestList');
    }
}