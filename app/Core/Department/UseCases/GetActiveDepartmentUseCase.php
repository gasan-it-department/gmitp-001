<?php

namespace App\Core\Department\UseCases;

use App\Core\Department\Models\Department;

class GetActiveDepartmentUseCase
{
    public function execute(string $municipalId)
    {
        return Department::where('is_active', true)
            ->where('municipal_id', $municipalId)
            ->get(['id', 'name', 'code', 'is_active']);
    }

}