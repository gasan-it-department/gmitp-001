<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Sites;

use App\Core\Cemetery\Actions\Sites\ListCemeterySitesAction;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ListCemeterySiteController extends Controller
{
    public function __construct(
        private ListCemeterySitesAction $listCemeterySites,
    ) {}

    public function __invoke(): Response
    {
        $sites = $this->listCemeterySites->execute(app('municipal_id'));

        return Inertia::render('Cemetery/Admin/Site/List/ListCemeterySites', [
            'municipality' => app('current_municipality'),
            'sites' => CemeterySiteResource::collection($sites)->resolve(),
        ]);
    }
}
