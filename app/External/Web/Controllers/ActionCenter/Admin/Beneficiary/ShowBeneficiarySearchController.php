<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Beneficiary;

use App\Core\ActionCenter\UseCase\Beneficiary\SearchBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Beneficiary\SearchBeneficiaryRequest;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the admin beneficiary-search page (interview lookup screen).
 *
 * Route: GET /{municipality}/action-center/admin/beneficiary/search
 *
 * Search state lives in the QUERY STRING (?search=&birth_date=&barangay=&sex=),
 * the same Inertia + URL-params pattern as ListAssistanceRequestController. The
 * controller stays thin: it validates the filters, hands them to the action,
 * and renders. All query/business logic lives in {@see SearchBeneficiaryAction}
 * — providing the page its data is part of displaying the page.
 */
class ShowBeneficiarySearchController extends Controller
{
    public function __construct(
        private readonly SearchBeneficiaryAction $searchBeneficiary,
    ) {
    }

    public function __invoke(SearchBeneficiaryRequest $request): Response
    {
        $municipalId = app('municipal_id');

        $filters = $request->validated();

        // DPA (RA 10173) access trail: record WHO looked up citizen PII and on
        // what terms. Only logged when an actual search ran — the bare page
        // load (no filters) returns nothing and is not worth a row.
        if ($request->hasAny(['search', 'birth_date', 'barangay', 'sex'])) {
            activity('beneficiary-search')
                ->causedBy($request->user())
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'filters'      => array_filter($filters, fn ($v) => filled($v)),
                ])
                ->log('Searched the beneficiary directory');
        }

        $results = $this->searchBeneficiary->execute($municipalId, $filters);

        return Inertia::render('ActionCenter/Admin/Beneficiary/BeneficiarySearch', [
            // Resource collection → { data, links, meta } (meta.links drives the
            // shared <Pagination /> on the page).
            'results' => BeneficiaryListResource::collection($results),

            // Echoed back so the React inputs hydrate on reload / shared links.
            'filters' => $filters,
        ]);
    }
}
