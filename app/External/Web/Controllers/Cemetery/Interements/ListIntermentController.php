<?php

namespace App\External\Web\Controllers\Cemetery\Interements;

use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ListIntermentController extends Controller
{

    public function __invoke()
    {

        return Inertia::render('Cemetery/Admin/Interments/Interments');

    }

}