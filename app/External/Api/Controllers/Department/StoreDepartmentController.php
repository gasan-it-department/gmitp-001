<?php

namespace App\External\Api\Controllers\Department;

use App\Core\Department\Actions\StoreDepartmentAction;
use App\Core\Department\Dto\SaveDepartmentDto;
use App\External\Api\Request\Department\SaveDepartmentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreDepartmentController extends Controller
{
    public function __construct(
        private StoreDepartmentAction $storeDepartment,
    ) {
    }

    public function __invoke(SaveDepartmentRequest $request): RedirectResponse
    {
        $this->storeDepartment->execute(
            SaveDepartmentDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Department created.');
    }
}
