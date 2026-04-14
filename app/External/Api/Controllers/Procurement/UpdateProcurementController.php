<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\UseCases\UpdateProcurementUseCase;
use App\External\Api\Request\Procurement\UpdateProcurementRequest;
use App\Http\Controllers\Controller;

class UpdateProcurementController extends Controller
{

    public function __construct(
        private UpdateProcurementUseCase $updateProcurment,
    ) {
    }

    public function __invoke(UpdateProcurementRequest $request, string $procurementId)
    {
        $municipality = app('current_municipality');
        $dto = UpdateProcurementDto::fromRequest($request);

        $this->updateProcurment->execute($dto, $procurementId);

        return redirect()->route('procurement.admin.show', ['municipality' => $municipality->slug, 'id' => $procurementId])->with('success', 'Procurement updated successfully.');

    }

}