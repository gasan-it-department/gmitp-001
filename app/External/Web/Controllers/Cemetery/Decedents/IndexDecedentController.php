<?php

namespace App\External\Web\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\ListDecedentsAction;
use App\External\Api\Resources\Cemetery\Decedents\DecedentListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexDecedentController extends Controller
{
    public function __construct(private ListDecedentsAction $listDecedents) {}

    public function __invoke(): Response
    {
        return Inertia::render('Cemetery/Admin/Decedents/List/ListDecedents', [
            'decedents' => DecedentListResource::collection($this->listDecedents->execute(app('municipal_id'))),
        ]);
    }
}
