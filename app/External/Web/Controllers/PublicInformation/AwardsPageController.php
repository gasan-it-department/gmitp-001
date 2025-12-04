<?php

namespace App\External\Web\Controllers\PublicInformation;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class AwardsPageController extends Controller
{
    public function index()
    {
        return Inertia::render('PublicInformation/Admin/AwardsPage');
    }
}