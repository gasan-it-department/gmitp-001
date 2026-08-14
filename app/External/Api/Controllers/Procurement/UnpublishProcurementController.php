<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\UseCases\UnpublishProcurementUseCase;
use App\External\Api\Request\Procurement\UnpublishProcurementRequest;
use App\Http\Controllers\Controller;

class UnpublishProcurementController extends Controller
{
    public function __construct(
        private UnpublishProcurementUseCase $unpublishProcurement,
    ) {}

    public function __invoke(UnpublishProcurementRequest $request, string $procurementId)
    {
        $this->unpublishProcurement->execute(
            app('municipal_id'),
            $procurementId,
            $request->validated('correction_reason'),
        );

        return redirect()->back()->with(
            'success',
            'Procurement is now private. You may correct the record and manage its documents.',
        );
    }
}
