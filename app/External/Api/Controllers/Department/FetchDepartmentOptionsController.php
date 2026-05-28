<?php

namespace App\External\Api\Controllers\Department;

use App\Core\Department\UseCases\GetActiveDepartmentUseCase;
use App\External\Api\Resources\Department\DepartmentListResource;
use App\Http\Controllers\Controller;

class FetchDepartmentOptionsController extends Controller
{

    public function __construct(
        private GetActiveDepartmentUseCase $departments,
    ) {
    }

    public function __invoke()
    {
        $departmentList = $this->departments->execute(app('municipal_id'));

        return DepartmentListResource::collection($departmentList);
    }

}