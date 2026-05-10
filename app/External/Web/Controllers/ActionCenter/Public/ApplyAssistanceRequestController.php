<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ApplyAssistanceRequestController extends Controller
{

    public function __construct()
    {
    }
    public function __invoke()
    {
        return Inertia::render('ActionCenter/Client/Apply/ApplyAssistance');
    }
}
