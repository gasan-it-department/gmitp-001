<?php

namespace App\External\Api\Controllers\Government\Official;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Government\UseCase\SearchOfficialsUseCase;

class SearchOfficialsController extends Controller
{

    public function __construct(

        private SearchOfficialsUseCase $searchOfficialsUseCase

    ) {
    }

    public function __invoke(Request $request)
    {

        $results = $this->searchOfficialsUseCase->execute(
            query: (string) $request->input('query', ''),
            municipalId: app('municipal_id')
        );

        return response()->json($results);
    }

}