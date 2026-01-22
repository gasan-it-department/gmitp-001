<?php

namespace App\External\Web\Controllers\Cemetery;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class IntermentsPageController extends Controller
{

    public function index()
    {

        return Inertia::render('Cemetery/Admin/Interment/Interment');

    }

}

