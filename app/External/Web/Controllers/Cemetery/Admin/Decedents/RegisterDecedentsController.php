<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Decedents;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RegisterDecedentsController extends Controller
{

    public function __construct()
    {
    }

    public function __invoke()
    {

        return Inertia::render(
            'Cemetery/Admin/Decedents/Register/RegisterDecedents',
            [
                'municipality' => app('current_municipality'),
            ]
        );

    }

}