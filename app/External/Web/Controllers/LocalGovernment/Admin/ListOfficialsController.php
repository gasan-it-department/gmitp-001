<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Http\Controllers\Controller;

class ListOfficialsController extends Controller
{

    public function __invoke()
    {

        return Inertia::render();

    }

}