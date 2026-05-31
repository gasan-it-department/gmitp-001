<?php

namespace App\Core\Department\Actions;

use App\Core\Department\Dto\SaveDepartmentDto;
use App\Core\Department\Models\Department;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class StoreDepartmentAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(SaveDepartmentDto $dto): Department
    {
        return DB::transaction(function () use ($dto) {
            $department = Department::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'name' => $dto->name,
                'code' => $dto->code,
                'description' => $dto->description,
                'is_active' => $dto->isActive,
            ]);

            if ($dto->logo) {
                $department
                    ->addMedia($dto->logo)
                    ->usingFileName($dto->logo->getClientOriginalName())
                    ->toMediaCollection('department_logo');
            }

            return $department->fresh(['media']);
        }, attempts: 3);
    }
}
