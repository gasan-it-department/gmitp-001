<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Decedents;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowDecedentProfile extends Controller
{

    public function __construct()
    {
    }
    public function __invoke()
    {
        return Inertia::render('Cemetery/Admin/Decedents/Profile/DecedentProfile', [

        ]);
    }

}