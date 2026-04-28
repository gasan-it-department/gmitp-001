<?php

namespace App\External\Web\Controllers\Tourism\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ListTourismAssetController extends Controller
{
    public function __construct()
    {
    }

    public function __invoke()
    {
        return Inertia::render('Tourism/Admin/Assets/List/TourismAssetList');
    }
}