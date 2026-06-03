<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Interments;

use App\Core\Cemetery\Actions\GetAvailablePlotsAction;
use App\Core\Cemetery\Actions\GetDecedentProfileAction;
use App\External\Api\Resources\Cemetery\PlotListResource;
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
        private GetAvailablePlotsAction $getAvailablePlots,
    ) {
    }

    public function __invoke(string $municipality, string $decedentId)
    {
        $municipalId = app('municipal_id');

        $decedent = $this->getDecedentProfile->execute($decedentId, $municipalId);
        $plots = $this->getAvailablePlots->execute($municipalId);

        return Inertia::render('Cemetery/Admin/Interments/Assign/AssignDecedent', [
            'decedent' => [
                'id' => $decedent->id,
                'display_name' => $this->resolveDisplay($decedent),
                'decedent_type' => $decedent->decedent_type?->value,
                'date_of_death' => $decedent->date_of_death?->format('M d, Y'),
            ],
            'available_plots' => PlotListResource::collection($plots),
        ]);
    }

    private function resolveDisplay($decedent): string
    {
        if (filled($decedent->memorial_name) && blank($decedent->last_name)) {
            return $decedent->memorial_name;
        }

        if (blank($decedent->first_name) && blank($decedent->last_name)) {
            return $decedent->reference_document_number
                ? 'UNKNOWN — ' . $decedent->reference_document_number
                : 'UNKNOWN';
        }

        return trim(sprintf(
            '%s, %s %s',
            $decedent->last_name ?? '',
            $decedent->first_name ?? '',
            $decedent->suffix ?? '',
        ));
    }
}
