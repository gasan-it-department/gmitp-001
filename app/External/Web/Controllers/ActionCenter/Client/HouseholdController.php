<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HouseholdController extends Controller
{

    public function index()
    {

        return Inertia::render('ActionCenter/Client/Household/Household');

    }

}