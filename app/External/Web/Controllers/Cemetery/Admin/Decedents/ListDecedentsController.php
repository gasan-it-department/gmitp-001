<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Decedents;

use App\Core\Cemetery\UseCase\GetDecedentListUseCase;
use App\External\Api\Resources\Cemetery\DecedentListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ListDecedentsController extends Controller
{

    public function __construct(

        private GetDecedentListUseCase $getDecedentList,

    ) {
    }

    public function __invoke()
    {
        $municipalId = app('municipal_id');

        $decedents = $this->getDecedentList->execute($municipalId);

        return Inertia::render(
            'Cemetery/Admin/Decedents/List/ListDecedents',
            [
                'decedents' => DecedentListResource::collection($decedents),
            ]
        );

    }

}