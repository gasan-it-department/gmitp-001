<?php

namespace App\External\Api\Controllers\Tourism;

use App\Core\Tourism\Dto\StoreTourismAssetDto;
use App\Core\Tourism\UseCase\TourismAsset\StoreTourismAssetAction;
use App\External\Api\Request\Tourism\StoreTourismAssetRequest;
use App\Http\Controllers\Controller;

class StoreTourismAssetController extends Controller
{
    public function __construct(
        private StoreTourismAssetAction $storeTourismAssetAction
    ) {
    }

    public function __invoke(StoreTourismAssetRequest $request)
    {

        $dto = StoreTourismAssetDto::fromRequest($request, app('municipal_id'));
        dd($dto);
        $this->storeTourismAssetAction->execute($dto);

        return redirect()->back()->with('success', 'successful');

    }
}