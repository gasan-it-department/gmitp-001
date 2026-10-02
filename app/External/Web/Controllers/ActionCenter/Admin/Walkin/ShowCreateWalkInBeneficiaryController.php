<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Walkin;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Religion;
use App\Core\Users\Enums\EnumPermissions;
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
 * Provides the tenant-scoped registry-check URL for the first form step.
 */
class ShowCreateWalkInBeneficiaryController extends Controller
{
    public function __invoke(string $municipality): Response
    {
        return Inertia::render('ActionCenter/Admin/Walkin/CreateWalkInBeneficiary', [
            'religions' => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus' => CivilStatus::option(),
            'relationships' => Relationship::toOptions(),
            'submitUrl' => route('actionCenter.walkin.store'),
            'checkUrl' => route('actionCenter.beneficiary.registration-check'),
            'canCorrect' => auth()->user()->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_CORRECT->value),
        ]);
    }
}
