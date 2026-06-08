<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Walkin;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Religion;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the admin WALK-IN beneficiary intake form.
 *
 * Route: GET /{municipality}/action-center/admin/walkin/create
 *
 * Display-only (Web layer) — same dropdown sources as the online profile
 * setup page so the two intake forms can never drift from the validators:
 * religions from the DB, enum options from PHP enums.
 *
 * If a prior submit was blocked by the soft duplicate guard, the store
 * controller flashed the matching records; we read them here and pass them as
 * `duplicateMatches` so the form can show them inline (the Api layer never
 * renders Inertia — it only flashes + redirects back here).
 */
class ShowCreateWalkInBeneficiaryController extends Controller
{
    public function __invoke(string $municipality): Response
    {
        return Inertia::render('ActionCenter/Admin/Walkin/CreateWalkInBeneficiary', [
            'religions'             => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus'           => CivilStatus::option(),
            'relationships'         => Relationship::toOptions(),
            'submitUrl'             => route('actionCenter.walkin.store'),
            // Possible-duplicate matches flashed by a blocked store attempt.
            'duplicateMatches'      => session('walkinDuplicateMatches', []),
        ]);
    }
}
