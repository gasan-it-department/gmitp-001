<?php

namespace App\Core\Department\Actions;

use App\Core\Department\Models\Department;
use Illuminate\Support\Facades\DB;

class ToggleDepartmentStatusAction
{
    public function execute(Department $department): Department
    {
        return DB::transaction(function () use ($department) {
            $department->update([
                'is_active' => !$department->is_active,
            ]);

            return $department->fresh();
        }, attempts: 3);
    }
}
