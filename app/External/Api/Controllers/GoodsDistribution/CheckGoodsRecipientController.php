<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\ActionCenter\UseCase\Beneficiary\CheckBeneficiaryRegistrationIdentityAction;
use App\External\Api\Request\ActionCenter\Beneficiary\CheckBeneficiaryRegistrationIdentityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class CheckGoodsRecipientController extends Controller
{
    public function __invoke(CheckBeneficiaryRegistrationIdentityRequest $request, CheckBeneficiaryRegistrationIdentityAction $check): JsonResponse
    {
        try {
            $result = $check->execute($request->validated(), app('municipal_id'), $request->user()->id, $request->validated('selected_member_id'), $request->validated('household_id'));
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        activity('beneficiary-search')->causedBy($request->user())
            ->withProperties(['municipal_id' => app('municipal_id'), 'candidate_keys' => array_column($result['candidates'], 'key')])
            ->log('Checked shared registry for Goods Distribution');

        return response()->json($result);
    }
}
