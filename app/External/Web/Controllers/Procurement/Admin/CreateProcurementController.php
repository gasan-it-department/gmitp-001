<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Department\Actions\ListActiveDepartmentAction;
use App\Core\Procurement\UseCases\GetProcurementFormOptions;
use App\External\Api\Resources\Procurement\ProcurementFundingSourceResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CreateProcurementController extends Controller
{

    public function __construct(
        private GetProcurementFormOptions $formOptionUseCase,
        private ListActiveDepartmentAction $listActiveDepartmentAction
    ) {
    }
    public function __invoke()
    {
        $options = $this->formOptionUseCase->execute();

        return Inertia::render('PublicInformation/Admin/Procurement/Create/Create', [
            'fundingSources' => ProcurementFundingSourceResource::collection($options['funding_sources']),
            'categories' => $options['categories'],
            'statuses' => $options['statuses'],
            'documentTypes' => $options['document_types'],
            'departments' => $this->listActiveDepartmentAction->execute(app('municipal_id')),
        ]);

    }

}