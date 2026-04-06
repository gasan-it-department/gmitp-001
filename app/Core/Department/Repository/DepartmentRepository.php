<?php

namespace App\Core\Department\Repository;

use App\Core\Department\Models\Department;

class DepartmentRepository
{

    public function findById(string $id): Department
    {
        return Department::findOrFail($id);
    }

    public function getActiveDepartments()
    {
        return Department::where('is_active', true)
            ->get(['id', 'name', 'code', 'is_active']);
    }

}