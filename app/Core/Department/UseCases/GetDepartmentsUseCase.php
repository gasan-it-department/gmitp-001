<?php

namespace App\Core\Department\UseCases;

use App\Core\Department\Repository\DepartmentRepository;

class GetDepartmentsUseCase
{

    public function __construct(
        private DepartmentRepository $departmentRepo,
    ) {
    }
    public function execute()
    {
        return $this->departmentRepo->getActiveDepartments();
    }

}