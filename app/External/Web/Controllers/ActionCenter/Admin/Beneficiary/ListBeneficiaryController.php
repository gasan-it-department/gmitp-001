<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Beneficiary;

use App\Core\ActionCenter\UseCase\Beneficiary\ListBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Beneficiary\SearchBeneficiaryRequest;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Render the municipality's complete beneficiary registry.
 */
class ListBeneficiaryController extends Controller
{
    public function __construct(
        private readonly ListBeneficiaryAction $listBeneficiaries,
    ) {
    }

    public function __invoke(SearchBeneficiaryRequest $request): Response
    {
        $filters = $request->validated();
        $beneficiaries = $this->listBeneficiaries->execute(app('municipal_id'), $filters);

        return Inertia::render('ActionCenter/Admin/Beneficiary/List/BeneficiaryList', [
            'beneficiaries' => BeneficiaryListResource::collection($beneficiaries),
            'filters' => $filters,
        ]);
    }
}
