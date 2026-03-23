<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Procurement\UseCases\GetProcurementUseCase;
use App\External\Api\Resources\PublicInformation\ProcurementResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowProcurementController extends Controller
{
    public function __construct(
        private GetProcurementUseCase $getProcurementUseCase,
    ) {
    }

    public function __invoke($municipality, $procurementId)
    {

        $procurement = $this->getProcurementUseCase->execute($procurementId, app('municipal_id'));

        return Inertia::render('PublicInformation/Admin/Procurement/Show/Procurement', [
            'procurement' => new ProcurementResource($procurement)
        ]);

    }

}