<?php

namespace App\External\Web\Controllers\CommunityReport;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class CommunityReportAdminController extends Controller
{

    public function index()
    {
        return Inertia::render('BulletinBoard/Admin/CommunityReportPage');
    }

}