<?php

namespace App\External\Web\Controllers\Department;

use App\Core\Department\Models\Department;
use App\External\Api\Resources\Department\DepartmentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EditDepartmentController extends Controller
{
    public function __invoke(string $municipality, string $department): Response
    {
        $model = Department::query()
            ->with('media')
            ->where('municipal_id', app('municipal_id'))
            ->findOrFail($department);

        return Inertia::render('Department/Form', [
            'department' => (new DepartmentDetailsResource($model))->resolve(),
        ]);
    }
}
