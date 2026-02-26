<?php

namespace App\External\Api\Controllers\Government\Official;

use App\Core\Government\UseCase\SearchOfficialUseCase;
use App\External\Api\Resources\Government\OfficialResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SearchOfficialsController extends Controller
{

    public function __construct(

        private SearchOfficialUseCase $searchOfficialsUseCase

    ) {
    }

    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string|max:200',
        ]);

        $query = strtoupper(trim($validated['query'] ?? ''));

        $results = $this->searchOfficialsUseCase->execute(
            query: (string) $query,
            municipalId: app('municipal_id')
        );
        return OfficialResource::collection($results);
    }

}