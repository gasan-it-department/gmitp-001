<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Actions\StoreHotlineAction;
use App\Core\Municipality\Dto\StoreHotlineDto;
use App\External\Api\Request\Municipality\StoreHotlineRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreHotlineController extends Controller
{
    public function __construct(
        private StoreHotlineAction $storeHotline,
    ) {
    }

    public function __invoke(StoreHotlineRequest $request): RedirectResponse
    {
        $this->storeHotline->execute(
            StoreHotlineDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Hotline added.');
    }
}
