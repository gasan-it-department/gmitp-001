<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\GetRegistrationHouseholdAction;
use App\External\Api\Request\GoodsDistribution\SearchRegistrationHouseholdsRequest;
use App\External\Api\Resources\GoodsDistribution\RegistrationHouseholdResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class SearchRegistrationHouseholdsController extends Controller
{
    public function __invoke(SearchRegistrationHouseholdsRequest $request, GetRegistrationHouseholdAction $households): AnonymousResourceCollection
    {
        return RegistrationHouseholdResource::collection($households->search(app('municipal_id'), trim($request->validated('search') ?? '')));
    }
}
