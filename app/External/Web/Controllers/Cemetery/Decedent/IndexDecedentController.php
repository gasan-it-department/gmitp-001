<?php

namespace App\External\Web\Controllers\Cemetery\Decedent;

use App\Core\Cemetery\Actions\ListDecedentsAction;
use App\External\Api\Resources\Cemetery\DecedentListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

/**
 * Admin decedents index page. Renders a paginated, tenant-scoped registry table.
 */
class IndexDecedentController extends Controller
{
    public function __construct(
        private ListDecedentsAction $listDecedents,
    ) {
    }

    public function __invoke()
    {
        $decedents = $this->listDecedents->execute(app('municipal_id'));

        return Inertia::render('Cemetery/Admin/Decedents/List/ListDecedents', [
            'decedents' => DecedentListResource::collection($decedents),
        ]);
    }
}
