<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\GetGoodsRecipientAction;
use App\Core\Users\Enums\EnumPermissions;
use App\External\Api\Resources\GoodsDistribution\GoodsRecipientResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ShowGoodsRecipientsController extends Controller
{
    public function __invoke(Request $request, GetGoodsRecipientAction $getRecipient): Response
    {
        $request->validate(['beneficiary_id' => ['nullable', 'ulid']]);

        return Inertia::render('GoodsDistribution/Recipients', [
            'recipient' => $request->filled('beneficiary_id')
                ? new GoodsRecipientResource($getRecipient->execute(app('municipal_id'), $request->string('beneficiary_id')->toString()))
                : null,
            'canManage' => $request->user()->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value),
            'canCorrect' => $request->user()->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_CORRECT->value),
            'canIntakeDistribution' => $request->user()->can('goods_distribution.requests.intake'),
        ]);
    }
}
