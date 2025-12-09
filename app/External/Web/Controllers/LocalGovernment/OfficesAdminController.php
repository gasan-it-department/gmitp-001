<?php

namespace App\External\Web\Controllers\LocalGovernment;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class OfficesAdminController extends Controller
{

    public function index()
    {
        return Inertia::render('LocalGovernment/Admin/OfficesPage');
    }

}