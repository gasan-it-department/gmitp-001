<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\UseCases\DeleteProcurementUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeleteProcurementController extends Controller
{

    public function __construct(
        private DeleteProcurementUseCase $deleteProcurement,
    ) {
    }

    public function __invoke(Request $request, string $procurementId)
    {
        $this->deleteProcurement->execute(app('municipal_id'), $procurementId);

        $municipality = app('current_municipality');

        return redirect()->route('procurement.admin.page', ['municipality' => $municipality->slug])
            ->with('success', 'Draft procurement has been successfully removed.');
    }

}