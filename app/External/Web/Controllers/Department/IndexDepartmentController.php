<?php

namespace App\External\Web\Controllers\Department;

use App\Core\Department\Models\Department;
use App\External\Api\Resources\Department\DepartmentListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexDepartmentController extends Controller
{
    public function __invoke(): Response
    {
        $departments = Department::query()
            ->where('municipal_id', app('municipal_id'))
            ->orderBy('name')
            ->get();

        return Inertia::render('Department/Index', [
            'departments' => DepartmentListResource::collection($departments),
        ]);
    }
}
