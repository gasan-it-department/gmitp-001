<?php

namespace App\External\Web\Controllers\Procurement;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class CitizenCharterController extends Controller
{
    public function index()
    {
        return Inertia::render('PublicInformation/Admin/CitizenCharterPage');
    }
}