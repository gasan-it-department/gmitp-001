<?php

namespace App\External\Api\Controllers\Department;

use App\Core\Department\UseCases\GetDepartmentsUseCase;
use App\External\Api\Resources\Department\DepartmentListResource;
use App\Http\Controllers\Controller;

class FetchDepartmentOptionsController extends Controller
{

    public function __construct(
        private GetDepartmentsUseCase $departments,
    ) {
    }

    public function __invoke()
    {
        $departmentList = $this->departments->execute();

        return DepartmentListResource::collection($departmentList);
    }

}