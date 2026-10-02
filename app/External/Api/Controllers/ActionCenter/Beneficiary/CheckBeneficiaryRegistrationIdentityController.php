<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\UseCase\Beneficiary\CheckBeneficiaryRegistrationIdentityAction;
use App\External\Api\Request\ActionCenter\Beneficiary\CheckBeneficiaryRegistrationIdentityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class CheckBeneficiaryRegistrationIdentityController extends Controller
{
    public function __construct(private readonly CheckBeneficiaryRegistrationIdentityAction $checkIdentity) {}

    public function __invoke(CheckBeneficiaryRegistrationIdentityRequest $request): JsonResponse
    {
        try {
            $result = $this->checkIdentity->execute(
                $request->validated(),
                app('municipal_id'),
                $request->user()->id,
                $request->validated('selected_member_id'),
                $request->validated('household_id'),
            );
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        activity('beneficiary-search')
            ->causedBy($request->user())
            ->withProperties([
                'municipal_id' => app('municipal_id'),
                'purpose' => 'pre-registration identity check',
                'candidate_keys' => array_column($result['candidates'], 'key'),
            ])
            ->log('Checked registry before beneficiary registration');

        return response()->json($result);
    }
}
