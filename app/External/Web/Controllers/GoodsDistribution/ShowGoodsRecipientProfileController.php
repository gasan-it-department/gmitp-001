<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsRecipientProfileAction;
use App\Core\GoodsDistribution\Services\DistributionCooldownService;
use App\Core\GoodsDistribution\Services\GoodsRecipientIdentityService;
use App\External\Api\Request\GoodsDistribution\RecipientProfilePageRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ShowGoodsRecipientProfileController extends Controller
{
    public function __invoke(RecipientProfilePageRequest $request, GoodsRecipientIdentityService $identities, ReadGoodsRecipientProfileAction $read): Response|RedirectResponse
    {
        $identity = $identities->resolve(app('municipal_id'), $request->route('memberId') ? 'member' : 'beneficiary', $request->route('memberId') ?? $request->route('beneficiaryId'));
        if ($identity['redirect_beneficiary_id']) {
            return redirect()->route('goodsDistribution.recipient.show', ['municipality' => $request->route('municipality'),
                'beneficiaryId' => $identity['redirect_beneficiary_id'], ...$request->validated()]);
        }
        if (! app(ReadDistributionRequestsAction::class)->schemaReady()) {
            return Inertia::render('GoodsDistribution/Inventory/Unavailable');
        }

        return Inertia::render('GoodsDistribution/RecipientProfile', [
            'profile' => $identity['profile'], 'filters' => $request->validated(),
            'cooldowns' => app(DistributionCooldownService::class)->profile(app('municipal_id'), $identity),
            'canCreate' => $identity['can_create'] && $request->user()->can('goods_distribution.requests.intake'),
            'canOpenFullProfile' => $identity['profile']['kind'] === 'beneficiary' && ! $identity['profile']['archived']
                && $request->user()->can('action_center.access') && $request->user()->can('action_center.beneficiaries.view'),
            ...$read->execute(app('municipal_id'), $identity, $request->validated()),
        ]);
    }
}
