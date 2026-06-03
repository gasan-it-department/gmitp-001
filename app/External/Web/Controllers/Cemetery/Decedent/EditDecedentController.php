<?php

namespace App\External\Web\Controllers\Cemetery\Decedent;

use App\Core\Cemetery\Actions\GetDecedentProfileAction;
use App\External\Api\Resources\Cemetery\DecedentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

/**
 * Renders the "edit decedent" form page, prefilled from the existing record.
 * Reuses GetDecedentProfileAction for the tenant-scoped fetch; the form posts
 * to UpdateDecedentController.
 */
class EditDecedentController extends Controller
{
    public function __construct(
        private GetDecedentProfileAction $getDecedentProfile,
    ) {
    }

    public function __invoke(string $municipality, string $decedentId)
    {
        $decedent = $this->getDecedentProfile->execute($decedentId, app('municipal_id'));

        return Inertia::render('Cemetery/Admin/Decedents/Edit/EditDecedents', [
            'municipality' => app('current_municipality'),
            'decedent' => new DecedentDetailsResource($decedent),
        ]);
    }
}
