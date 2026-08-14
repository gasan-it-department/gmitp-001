<?php

namespace App\External\Web\Controllers\Procurement\Public;

use App\Core\Procurement\UseCases\GetPublishedProcurementUseCase;
use App\External\Api\Resources\Procurement\ProcurementTransparencyDetailResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowPublicProcurementController extends Controller
{
    public function __construct(
        private GetPublishedProcurementUseCase $getPublishedProcurement,
    ) {}

    public function __invoke(string $municipality, string $procurementId)
    {
        $procurement = $this->getPublishedProcurement->execute(
            $procurementId,
            app('municipal_id'),
        );

        return Inertia::render('PublicInformation/Client/Show/TransparencyDetails', [
            'procurement' => new ProcurementTransparencyDetailResource($procurement),
        ]);
    }
}
