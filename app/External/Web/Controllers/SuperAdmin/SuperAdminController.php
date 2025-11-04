<?php

namespace App\External\Web\Controllers\SuperAdmin;

use Inertia\Inertia;

use App\Http\Controllers\Controller;

class SuperAdminController extends Controller
{
    public function showDashboard()
    {
        return Inertia::render('SuperAdmin/Dashboard/Dashboard');
    }

    public function showCreateUsers()
    {
        return Inertia::render('SuperAdmin/RegisterUser/RegisterUser');
    }

    public function showMunicipalityPage()
    {
        return Inertia::render('SuperAdmin/Municipality/MunicipalityPage');
    }
}