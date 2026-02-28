<?php

namespace App\External\Web\Controllers\LocalGovernment\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowOfficialsRosterController extends Controller
{
    public function __construct(

    ) {
    }

    public function __invoke()
    {



        return Inertia::render(
            '',
            [

            ]
        );

    }
}