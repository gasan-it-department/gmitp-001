<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\Dto\FailureProcurementDto;
use App\Core\Procurement\UseCases\DeclareFailureProcurementUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeclareFailureProcurementController extends Controller
{
    public function __construct(
        private DeclareFailureProcurementUseCase $declareFailureProcurementUseCase
    ) {
    }

    public function __invoke(Request $request, string $procurementId)
    {
        $validated = $request->validate([
            'failure_reason' => ['required', 'string', 'max:1000'],
            'failed_date' => ['required', 'date']
        ]);

        $dto = FailureProcurementDto::fromRequest($validated, $procurementId);

        $this->declareFailureProcurementUseCase->execute($dto);

        return redirect()->back()->with('success', 'Bidding failure declared successfully.');
    }
}