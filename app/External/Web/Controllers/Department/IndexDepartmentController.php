<?php

namespace App\External\Web\Controllers\Department;

use App\Core\Department\Actions\ListDepartmentsAction;
use App\Core\Department\Dto\DepartmentFiltersDto;
use App\External\Api\Request\Department\IndexDepartmentRequest;
use App\External\Api\Resources\Department\DepartmentListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexDepartmentController extends Controller
{
    public function __construct(
        private ListDepartmentsAction $listDepartments,
    ) {}

    public function __invoke(IndexDepartmentRequest $request): Response
    {
        $filters = DepartmentFiltersDto::fromArray($request->filters());
        $departments = $this->listDepartments->execute(
            municipalId: app('municipal_id'),
            filters: $filters,
        );

        return Inertia::render('Department/Index', [
            'departments' => DepartmentListResource::collection($departments),
            'filters' => $filters->toArray(),
            'status_options' => [
                ['value' => DepartmentFiltersDto::STATUS_ACTIVE, 'label' => 'Active'],
                ['value' => DepartmentFiltersDto::STATUS_INACTIVE, 'label' => 'Inactive'],
            ],
            'sort_options' => [
                ['value' => DepartmentFiltersDto::SORT_NAME_ASC, 'label' => 'Name A–Z'],
                ['value' => DepartmentFiltersDto::SORT_NAME_DESC, 'label' => 'Name Z–A'],
                ['value' => DepartmentFiltersDto::SORT_CREATED_DESC, 'label' => 'Newest first'],
            ],
        ]);
    }
}
