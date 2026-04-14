<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Procurement\UseCases\GetProcurementFormOptions;
use App\Core\Procurement\UseCases\GetProcurementUseCase;
use App\External\Api\Resources\Procurement\ProcurementDetailResource;
use App\External\Api\Resources\Procurement\ProcurementFundingSourceResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EditProcurementController extends Controller
{

    public function __construct(
        private GetProcurementFormOptions $formOptionUseCase,
    ) {
    }

    public function __invoke($municipality, $id, GetProcurementUseCase $getProcurementUseCase)
    {

        $procurement = $getProcurementUseCase->execute($id, app('municipal_id'));

        $options = $this->formOptionUseCase->execute();
        return Inertia::render('PublicInformation/Admin/Procurement/Edit/Edit', [
            'procurement' => new ProcurementDetailResource($procurement),
            'fundingSources' => ProcurementFundingSourceResource::collection($options['funding_sources']),
            'categories' => $options['categories'],
            'documentTypes' => $options['document_types'],
        ]);

    }

}