<?php

namespace App\External\Web\Controllers\Department;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateDepartmentController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Department/Form', [
            'department' => null,
        ]);
    }
}
