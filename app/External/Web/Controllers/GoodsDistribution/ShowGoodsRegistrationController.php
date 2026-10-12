<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\GetRegistrationHouseholdAction;
use App\External\Web\Controllers\ActionCenter\Admin\Household\ShowCreateHouseholdBeneficiaryController;
use App\External\Web\Controllers\ActionCenter\Admin\Walkin\ShowCreateWalkInBeneficiaryController;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

final class ShowGoodsRegistrationController extends Controller
{
    public function __invoke(
        Request $request,
        string $municipality,
        GetRegistrationHouseholdAction $household,
        ShowCreateWalkInBeneficiaryController $showHead,
        ShowCreateHouseholdBeneficiaryController $showMember,
        ?string $householdId = null,
    ): Response|RedirectResponse {
        try {
            if ($householdId !== null) {
                $household->execute(app('municipal_id'), $householdId);
            }
        } catch (\DomainException $exception) {
            return redirect()->route('goodsDistribution.recipients', ['municipality' => $municipality])->with('error', $exception->getMessage());
        }

        $draft = null;
        if ($request->filled('draft')) {
            $draft = $request->session()->get('goods_registration.'.$request->string('draft')->toString());
            abort_unless(is_array($draft)
                && $draft['municipal_id'] === app('municipal_id')
                && $draft['actor_id'] === $request->user()->id
                && $draft['household_id'] === $householdId
                && $draft['created_at'] >= now()->subMinutes(30)->timestamp, 404);
        }

        $response = $householdId === null ? $showHead($municipality) : $showMember($municipality, $householdId);

        return $response->with([
            'goodsDistribution' => true,
            'canVerify' => $request->user()->can('action_center.beneficiaries.verify'),
            'returnUrl' => route('goodsDistribution.recipients', ['municipality' => $municipality]),
            'registrationDraft' => $draft ? $draft['registration'] : null,
            'checkUrl' => route('goodsDistribution.identity-check'),
            'submitUrl' => $householdId === null
                ? route('goodsDistribution.head.store')
                : route('goodsDistribution.member.store', ['householdId' => $householdId]),
        ]);
    }
}
