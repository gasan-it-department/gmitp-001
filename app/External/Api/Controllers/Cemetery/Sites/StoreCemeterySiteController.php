<?php

namespace App\External\Api\Controllers\Cemetery\Sites;

use App\Core\Cemetery\Actions\Sites\StoreCemeterySiteAction;
use App\Core\Cemetery\Dto\Sites\CemeterySiteDto;
use App\External\Api\Request\Cemetery\Sites\StoreCemeterySiteRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreCemeterySiteController extends Controller
{
    public function __construct(
        private StoreCemeterySiteAction $storeCemeterySite,
    ) {}

    public function __invoke(StoreCemeterySiteRequest $request): RedirectResponse
    {
        $this->storeCemeterySite->execute(
            CemeterySiteDto::fromRequest($request->validated())
        );

        return redirect()
            ->route('cemetery.admin.sites.list.page', [
                'municipality' => app('current_municipality')->slug,
            ])
            ->with('success', 'Cemetery site created successfully.');
    }
}
