<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use Inertia\Inertia;
use App\Http\Controllers\Controller;

class AssistanceRequestPageController extends Controller
{

    public function create()
    {

        return Inertia::render('ActionCenter/Client/Requests/Create');

    }

}