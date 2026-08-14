<?php

namespace App\External\Api\Controllers\Procurement;

use App\Core\Procurement\UseCases\PublishedProcurementUseCase;
use App\Http\Controllers\Controller;

class PublishProcurementController extends Controller
{
    public function __construct(
        private PublishedProcurementUseCase $publishProcurement,
    ) {}

    public function __invoke(string $procurementId)
    {
        $this->publishProcurement->execute(app('municipal_id'), $procurementId);

        return redirect()->back()->with('success', 'Procurement published to the citizen transparency portal.');
    }
}
