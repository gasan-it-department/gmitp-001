<?php

namespace App\External\Api\Controllers\Department;

use App\Core\Department\Actions\UpdateDepartmentAction;
use App\Core\Department\Dto\SaveDepartmentDto;
use App\Core\Department\Models\Department;
use App\External\Api\Request\Department\SaveDepartmentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateDepartmentController extends Controller
{
    public function __construct(
        private UpdateDepartmentAction $updateDepartment,
    ) {
    }

    public function __invoke(SaveDepartmentRequest $request, string $department): RedirectResponse
    {
        $model = Department::query()
            ->where('municipal_id', app('municipal_id'))
            ->findOrFail($department);

        $this->updateDepartment->execute(
            $model,
            SaveDepartmentDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Department updated.');
    }
}
