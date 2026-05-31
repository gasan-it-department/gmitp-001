<?php

namespace App\External\Api\Controllers\Department;

use App\Core\Department\Actions\ToggleDepartmentStatusAction;
use App\Core\Department\Models\Department;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ToggleDepartmentStatusController extends Controller
{
    public function __construct(
        private ToggleDepartmentStatusAction $toggleStatus,
    ) {
    }

    public function __invoke(string $department): RedirectResponse
    {
        $model = Department::query()
            ->where('municipal_id', app('municipal_id'))
            ->findOrFail($department);

        $updated = $this->toggleStatus->execute($model);

        return back()->with(
            'success',
            $updated->is_active ? 'Department activated.' : 'Department deactivated.',
        );
    }
}
