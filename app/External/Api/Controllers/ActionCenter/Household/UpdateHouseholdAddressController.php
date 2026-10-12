<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\UpdateHouseholdAddressDto;
use App\Core\ActionCenter\UseCase\Household\UpdateHouseholdAddressAction;
use App\External\Api\Request\ActionCenter\Household\UpdateHouseholdAddressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateHouseholdAddressController extends Controller
{
    public function __construct(private readonly UpdateHouseholdAddressAction $updateAddress) {}

    public function __invoke(string $householdId, UpdateHouseholdAddressRequest $request): RedirectResponse
    {
        try {
            $this->updateAddress->execute(new UpdateHouseholdAddressDto(
                householdId: $householdId,
                municipalId: app('municipal_id'),
                actingAdminId: $request->user()->id,
                barangayCode: $request->validated('barangay_code'),
                street: $request->validated('street'),
                reason: $request->validated('reason'),
                expectedFingerprint: $request->validated('expected_fingerprint'),
            ));

            return back()->with('success', 'Household address saved. Existing request addresses remain unchanged.');
        } catch (\DomainException $exception) {
            return back()->withInput()->withErrors(['household_address' => $exception->getMessage()]);
        }
    }
}
