<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Household;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Models\Religion;
use App\Core\Users\Enums\EnumPermissions;
use App\External\Api\Resources\ActionCenter\Household\HouseholdProfileResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class ShowCreateHouseholdBeneficiaryController extends Controller
{
    public function __invoke(string $municipality, string $householdId): Response
    {
        $household = Household::query()
            ->where('municipal_id', app('municipal_id'))
            ->with('activeHead.beneficiary')
            ->findOrFail($householdId);

        $member = request()->filled('member_id')
            ? HouseholdMember::query()
                ->whereKey(request()->string('member_id')->toString())
                ->where('household_id', $household->id)
                ->where('is_active', true)
                ->whereNull('beneficiary_id')
                ->where('relationship', '!=', 'head')
                ->firstOrFail()
            : null;

        return Inertia::render('ActionCenter/Admin/Household/CreateHouseholdBeneficiary', [
            'household' => new HouseholdProfileResource($household),
            'religions' => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus' => CivilStatus::option(),
            'relationships' => collect(Relationship::toOptions())
                ->reject(fn (array $option): bool => $option['value'] === Relationship::Head->value)
                ->values(),
            'submitUrl' => route('actionCenter.household.beneficiaries.store', [
                'householdId' => $household->id,
            ]),
            'checkUrl' => route('actionCenter.beneficiary.registration-check'),
            'canCorrect' => auth()->user()->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_CORRECT->value),
            'prefillIdentity' => $member ? [
                'member_id' => $member->id,
                'first_name' => $member->first_name,
                'middle_name' => $member->middle_name,
                'last_name' => $member->last_name,
                'suffix' => $member->suffix,
                'birth_date' => $member->birth_date?->toDateString(),
                'relationship' => $member->relationship,
            ] : null,
        ]);
    }
}
