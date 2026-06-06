<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Department\Models\Department;
use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\UseCases\GetMunicipalityProcurementsUseCase;
use App\Core\Procurement\UseCases\GetProcurementFormOptions;
use App\External\Api\Request\Procurement\GetProcurementRequest;
use App\External\Api\Resources\Department\DepartmentOptionsResource;
use App\External\Api\Resources\Procurement\ProcurementFundingSourceResource;
use App\External\Api\Resources\Procurement\ProcurementListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ListProcurementController extends Controller
{
    public function __construct(
        private GetProcurementFormOptions $getProcurementFormOptions,
    ) {
    }

    public function __invoke(GetProcurementRequest $request, GetMunicipalityProcurementsUseCase $getProcurements)
    {
        $municipalId = app('municipal_id');

        $dto = ProcurementFilterDto::fromRequest($request->validated());

        $procurements = $getProcurements->execute($municipalId, $dto);

        $options = $this->getProcurementFormOptions->execute();

        $departments = Department::query()
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('PublicInformation/Admin/Procurement/List/ProcurementList', [
            'procurements' => ProcurementListResource::collection($procurements),
            'departments' => DepartmentOptionsResource::collection($departments),
            'fundingSources' => ProcurementFundingSourceResource::collection($options['funding_sources']),
            'categories' => $options['categories'],
            'statuses' => $options['statuses'],

            'filters' => $request->only(['search', 'status', 'category', 'department', 'funding']),
        ]);
    }
}
