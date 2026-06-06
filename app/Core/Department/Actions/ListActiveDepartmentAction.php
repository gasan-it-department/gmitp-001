<?php

namespace App\Core\Department\Actions;

use App\Core\Department\Models\Department;

class ListActiveDepartmentAction
{
    public function execute(string $municipalId)
    {
        return Department::query()
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($d) => ['id' => $d->id, 'name' => $d->name])
            ->values();
    }
}