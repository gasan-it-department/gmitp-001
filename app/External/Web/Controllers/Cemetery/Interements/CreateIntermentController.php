<?php

namespace App\External\Web\Controllers\Cemetery\Interements;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CreateIntermentController extends Controller
{

    public function __invoke()
    {

        return Inertia::render('Cemetery/Admin/Interment/Create/CreateInterment', [

            'municipality' => app('current_municipality')

        ]);

    }

}