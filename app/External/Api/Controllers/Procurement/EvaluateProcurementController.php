<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\UseCases\EvaluateProcurementUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EvaluateProcurementController extends Controller
{

    public function __construct(
        private EvaluateProcurementUseCase $evaluateProcurement
    ) {
    }

    public function __invoke(Request $request, string $procurementId)
    {
        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:2000']
        ]);
        $this->evaluateProcurement->execute(app('municipal_id'), $procurementId, $validated['remarks']);

        return redirect()->back()->with('success', 'Bidding closed. Project is now under evaluation.');
    }
}