<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Interments;

use App\Core\Cemetery\Actions\Decedents\GetDecedentProfileAction;
use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Actions\Sites\ListCemeterySitesAction;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

/**
 * Renders the page that lets an admin pick an AVAILABLE plot for a specific
 * decedent. The decedent_id is supplied in the URL — we hydrate the form with
 * the decedent's display name + the list of plots that can still be assigned.
 */
class AssignDecedentToPlotController extends Controller
{
    public function __construct(
        private GetDecedentProfileAction $getDecedentProfile,
        private GetIntermentReadinessAction $getIntermentReadiness,
        private ListCemeterySitesAction $listCemeterySites,
    ) {}

    public function __invoke(string $municipality, string $decedentId)
    {
        $municipalId = app('municipal_id');

        $decedent = $this->getDecedentProfile->execute($decedentId, $municipalId);
        abort_unless(
            $this->getIntermentReadiness->execute($decedent)['ready'],
            409,
            'This decedent is not ready for interment.',
        );
        $sites = $this->listCemeterySites->execute($municipalId)
            ->where('status', 'active')
            ->values();

        return Inertia::render('Cemetery/Admin/Interments/Assign/AssignDecedent', [
            'decedent' => [
                'id' => $decedent->id,
                'display_name' => $this->resolveDisplay($decedent),
                'record_type' => $decedent->vital_record_type?->value,
                'identity_status' => $decedent->identity_status?->value,
                'date_of_death' => $decedent->date_of_death?->format('M d, Y'),
            ],
            'sites' => CemeterySiteResource::collection($sites)->resolve(),
        ]);
    }

    private function resolveDisplay($decedent): string
    {
        if ($decedent->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($decedent->unidentifiedDetail?->case_reference ?? $decedent->id);
        }

        if (! $decedent->has_legal_name && filled($decedent->memorial_name)) {
            return $decedent->memorial_name;
        }

        return trim(sprintf(
            '%s, %s %s',
            $decedent->last_name ?? '',
            $decedent->first_name ?? '',
            $decedent->suffix ?? '',
        ));
    }
}
