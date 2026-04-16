<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Department\UseCases\GetDepartmentsUseCase;
use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\UseCases\GetMunicipalityProcurementsUseCase;
use App\Core\Procurement\UseCases\GetProcurementFormOptions;
use App\External\Api\Request\Procurement\GetProcurementRequest;
use App\External\Api\Resources\Department\DepartmentListResource;
use App\External\Api\Resources\Procurement\ProcurementFundingSourceResource;
use App\External\Api\Resources\Procurement\ProcurementListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ListProcurementController extends Controller
{

    public function __construct(
        private GetProcurementFormOptions $getProcurementFormOptions,
        private GetDepartmentsUseCase $getDepartmentsUseCase

    ) {
    }

    public function __invoke(GetProcurementRequest $request, GetMunicipalityProcurementsUseCase $getProcurements)
    {
        $municipalId = app('municipal_id');

        $dto = ProcurementFilterDto::fromRequest($request->validated());

        $procurements = $getProcurements->execute($municipalId, $dto);

        $options = $this->getProcurementFormOptions->execute();

        $departments = $this->getDepartmentsUseCase->execute();

        return Inertia::render('PublicInformation/Admin/Procurement/List/ProcurementList', [
            'procurements' => ProcurementListResource::collection($procurements),
            'departments' => DepartmentListResource::collection($departments),
            'fundingSources' => ProcurementFundingSourceResource::collection($options['funding_sources']),
            'categories' => $options['categories'],
            'statuses' => $options['statuses'],

            'filters' => $request->only(['search', 'status', 'category', 'department', 'funding']),
        ]);

    }
}