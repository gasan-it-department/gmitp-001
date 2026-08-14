<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\Dto\CancelProcurementDto;
use App\Core\Procurement\UseCases\CancelProcurementUseCase;
use App\External\Api\Request\Procurement\CancelProcurementRequest;
use App\Http\Controllers\Controller;

class CancelProcurementController extends Controller
{
    public function __construct(
        private CancelProcurementUseCase $cancelProcurement,
    ) {}

    public function __invoke(CancelProcurementRequest $request, string $procurementId)
    {
        $this->cancelProcurement->execute(
            CancelProcurementDto::fromRequest($request->validated(), $procurementId),
        );

        return redirect()->back()->with('success', 'Procurement cancelled and the public record updated.');
    }
}
