<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\Dto\AwardProcurementDto;
use App\Core\Procurement\UseCases\AwardProcurementUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AwardProcurementController extends Controller
{
    public function __construct(
        private AwardProcurementUseCase $awardProcurementUseCase
    ) {
    }

    public function __invoke(Request $request, string $procurementId)
    {
        $validated = $request->validate([
            'winning_bidder_name' => ['required', 'string', 'max:255'],
            'contract_amount' => ['required', 'numeric', 'min:0'],
            'awarded_date' => ['required', 'date']
        ]);

        $dto = AwardProcurementDto::fromRequest($validated, $procurementId);

        $this->awardProcurementUseCase->execute($dto);

        return redirect()->back()->with('success', 'Project successfully awarded.');
    }
}