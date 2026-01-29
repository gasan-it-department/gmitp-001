<?php

namespace App\External\Web\Controllers\PublicInformation\Admin;

use App\Core\PublicInformation\UseCases\GetProcurementUseCase;
use App\External\Api\Resources\PublicInformation\ProcurementResource;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

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