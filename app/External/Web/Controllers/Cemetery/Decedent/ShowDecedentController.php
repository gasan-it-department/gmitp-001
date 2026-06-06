<?php

namespace App\External\Web\Controllers\Cemetery\Decedent;

use App\Core\Cemetery\Actions\GetDecedentProfileAction;
use App\External\Api\Resources\Cemetery\DecedentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

/**
 * Renders a single decedent's profile, including the current interment + plot
 * snapshot. Tenant-scoped — a cross-municipality id 404s at the action.
 */
class ShowDecedentController extends Controller
{
    public function __construct(
        private GetDecedentProfileAction $getDecedentProfile,
    ) {
    }

    public function __invoke(string $municipality, string $decedentId)
    {
        $decedent = $this->getDecedentProfile->execute($decedentId, app('municipal_id'));

        return Inertia::render('Cemetery/Admin/Decedents/Profile/DecedentProfile', [
            'decedent' => new DecedentDetailsResource($decedent),
        ]);
    }
}
