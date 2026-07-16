<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\ReassignBeneficiaryHouseholdDto;
use App\Core\ActionCenter\UseCase\Beneficiary\ReassignBeneficiaryHouseholdAction;
use App\External\Api\Request\ActionCenter\Beneficiary\ReassignBeneficiaryHouseholdRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class ReassignBeneficiaryHouseholdController extends Controller
{
    public function __construct(
        private readonly ReassignBeneficiaryHouseholdAction $reassignHousehold,
    ) {}

    public function __invoke(
        string $beneficiaryId,
        ReassignBeneficiaryHouseholdRequest $request,
    ): RedirectResponse {
        try {
            $dto = ReassignBeneficiaryHouseholdDto::fromArray(
                $request->validated(),
                $beneficiaryId,
                app('municipal_id'),
                auth()->id(),
            );

            $this->reassignHousehold->execute($dto);

            return back()->with(
                'success',
                'Household reassignment processed successfully.',
            );
        } catch (\DomainException $e) {
            return back()->withErrors(['beneficiary' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()->withErrors(['beneficiary' => $e->getMessage()]);
        }
    }
}
