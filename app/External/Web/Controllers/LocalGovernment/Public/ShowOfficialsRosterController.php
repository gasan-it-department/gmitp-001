<?php

namespace App\External\Web\Controllers\LocalGovernment\Public;

use App\Core\Government\UseCase\GetPublicRosterUseCase;
use App\External\Api\Resources\Government\PublicRosterResource;
use App\External\Api\Resources\Government\TermResource;
use App\External\Api\Resources\Municipality\MunicipalityResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShowOfficialsRosterController extends Controller
{
    public function __construct(
        private GetPublicRosterUseCase $getPublishedTermsUseCase,
    ) {
    }

    public function __invoke(Request $request, string $municipalSlug, ?string $termSlug = null, )
    {
        $publishedTerms = $this->getPublishedTermsUseCase->execute(app('municipal_id'), $termSlug);

        return Inertia::render(
            'LocalGovernment/Public/GovernmentPage',
            [
                'municipality' => new MunicipalityResource(app('current_municipality')),
                'publishedTerms' => TermResource::collection($publishedTerms['publishedTerms']),
                'term' => new TermResource($publishedTerms['term']),
                'roster' => PublicRosterResource::collection($publishedTerms['roster']),
            ]
        );

    }
}