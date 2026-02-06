<?php

namespace App\External\Web\Controllers\Cemetery;

use Inertia\Inertia;
use App\Http\Controllers\Controller;

class CemeteryController extends Controller
{

    public function index()
    {
        return Inertia::render('Cemetery/Admin/Cemetery');

    }

}