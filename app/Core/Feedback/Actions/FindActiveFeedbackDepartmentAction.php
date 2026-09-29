<?php

namespace App\Core\Feedback\Actions;

use App\Core\Department\Models\Department;

class FindActiveFeedbackDepartmentAction
{
    public function execute(string $departmentId, string $municipalId): Department
    {
        return Department::query()
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->with('media')
            ->findOrFail($departmentId);
    }
}
