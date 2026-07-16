<?php

namespace App\External\Api\Controllers\V1\Tourism;

use App\Core\Tourism\Actions\FetchAgaTourismAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListTourismController extends Controller
{
    public function __construct(
        private FetchAgaTourismAction $fetchAgaTourism,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $page = max((int) $request->integer('page', 1), 1);
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        return response()->json(
            $this->fetchAgaTourism->execute($page, $perPage),
        );
    }
}
