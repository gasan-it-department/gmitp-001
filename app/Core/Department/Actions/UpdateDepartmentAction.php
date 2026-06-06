<?php

namespace App\Core\Department\Actions;

use App\Core\Department\Dto\SaveDepartmentDto;
use App\Core\Department\Models\Department;
use Illuminate\Support\Facades\DB;

class UpdateDepartmentAction
{
    public function execute(Department $department, SaveDepartmentDto $dto): Department
    {
        return DB::transaction(function () use ($department, $dto) {
            $department->update([
                'name' => $dto->name,
                'code' => $dto->code,
                'description' => $dto->description,
                'is_active' => $dto->isActive,
            ]);

            if ($dto->logo) {
                $department->clearMediaCollection('department_logo');

                $department
                    ->addMedia($dto->logo)
                    ->usingFileName($dto->logo->getClientOriginalName())
                    ->toMediaCollection('department_logo');
            }

            return $department->fresh(['media']);
        }, attempts: 3);
    }
}
