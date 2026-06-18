<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Models\Religion;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowBeneficiaryProfileCorrectionController extends Controller
{
    public function __invoke(
        string $municipality,
        Request $request,
        ResolveApplicantProfileAction $resolveProfile,
    ): Response|RedirectResponse {
        $currentMunicipality = app('current_municipality');
        $beneficiary = $resolveProfile->execute($request->user()->id, $currentMunicipality->id);

        if ($beneficiary === null) {
            return redirect()->route('actionCenter.profile.setup', ['municipality' => $municipality]);
        }

        if (! $beneficiary->isIntakeRejected()) {
            return redirect()
                ->route('actionCenter.index', ['municipality' => $municipality])
                ->with('info', 'Only rejected beneficiary profiles can submit a correction.');
        }

        $beneficiary->load(['household', 'media']);

        return Inertia::render('ActionCenter/Client/Apply/Beneficiary/ProfileSetUpWizard', [
            'mode' => 'correction',
            'religions' => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus' => CivilStatus::option(),
            'relationships' => Relationship::toOptions(),
            'sexOptions' => array_map(
                fn (Sex $case) => ['value' => $case->value, 'label' => $case->label()],
                Sex::cases(),
            ),
            'submitUrl' => route('actionCenter.profile.correction.store'),
            'initialData' => [
                'first_name' => $beneficiary->first_name,
                'middle_name' => $beneficiary->middle_name ?? '',
                'last_name' => $beneficiary->last_name,
                'suffix' => $beneficiary->suffix ?? '',
                'sex' => $beneficiary->sex,
                'birth_date' => $beneficiary->birth_date?->toDateString() ?? '',
                'religion_id' => $beneficiary->religion_id ?? '',
                'educational_attainment' => $beneficiary->educational_attainment?->value ?? '',
                'identity_id_front' => null,
                'identity_id_back' => null,
                'civil_status' => $beneficiary->civil_status?->value ?? '',
                'occupation' => $beneficiary->occupation ?? '',
                'monthly_income' => $beneficiary->monthly_income !== null ? (string) (float) $beneficiary->monthly_income : '',
                'contact_phone' => $beneficiary->contact_phone ?? $request->user()?->phone ?? '',
                'barangay' => $beneficiary->household?->barangay ?? '',
                'barangay_code' => $beneficiary->household?->barangay_psgc_code ?? '',
                'street' => $beneficiary->household?->street ?? '',
                'terms_consent' => true,
                'household_members' => $this->provisionalMembers($beneficiary->household_id),
            ],
            'existingIdentityDocuments' => [
                'front' => $beneficiary->getFirstMedia('identity_id_front') !== null,
                'back' => $beneficiary->getFirstMedia('identity_id_back') !== null,
            ],
            'rejectionReason' => $beneficiary->intake_rejection_reason,
        ]);
    }

    private function provisionalMembers(string $householdId): array
    {
        return HouseholdMember::query()
            ->where('household_id', $householdId)
            ->whereNull('beneficiary_id')
            ->where('is_verified_dependent', false)
            ->where(function ($query) {
                $query
                    ->whereNull('relationship')
                    ->orWhere('relationship', '!=', Relationship::Head->value);
            })
            ->orderBy('created_at')
            ->get()
            ->map(fn (HouseholdMember $member) => [
                'first_name' => $member->first_name,
                'middle_name' => $member->middle_name ?? '',
                'last_name' => $member->last_name,
                'suffix' => $member->suffix ?? '',
                'relationship' => $member->relationship ?? '',
                'birth_date' => $member->birth_date?->toDateString() ?? '',
                'sex' => $member->sex ?? '',
                'civil_status' => $member->civil_status?->value ?? '',
                'educational_attainment' => $member->educational_attainment?->value ?? '',
                'occupation' => $member->occupation ?? '',
                'monthly_income' => $member->monthly_income !== null ? (string) (float) $member->monthly_income : '',
                'religion_id' => $member->religion_id ?? '',
            ])
            ->all();
    }
}
