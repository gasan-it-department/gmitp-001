<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Religion;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the one-time profile setup form for first-time portal users.
 *
 * Route: GET /{municipality}/action-center/profile/setup
 *
 * Passes religion options from the DB so the frontend dropdown
 * is never hardcoded — MSWD can manage entries without a deploy.
 *
 * Enum-backed dropdowns (educational attainment, civil status) come from
 * the PHP enums directly so the form options can't drift from the
 * validator rules.
 */
class ShowProfileSetupController extends Controller
{
    public function __invoke(string $municipality): Response
    {
        return Inertia::render('ActionCenter/Client/Apply/Beneficiary/ProfileSetUpWizard', [
            'religions' => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus' => CivilStatus::option(),
            // Powers the relationship dropdown in the household section.
            // Same enum the apply form's "on behalf of" picker uses.
            'relationships' => Relationship::toOptions(),
            'submitUrl' => route('actionCenter.profile.setup.store'),
        ]);
    }
}
