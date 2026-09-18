<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Beneficiary\CreateHouseholdBeneficiaryDto;
use App\Core\ActionCenter\Exceptions\PotentialDuplicateBeneficiaryException;
use App\Core\ActionCenter\Exceptions\WalkInBeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateBeneficiaryInHouseholdAction;
use App\External\Api\Request\ActionCenter\Household\StoreHouseholdBeneficiaryRequest;
use App\External\Api\Resources\ActionCenter\Walkin\WalkInBeneficiaryResource;
use App\Http\Controllers\Controller;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\RedirectResponse;

final class StoreHouseholdBeneficiaryController extends Controller
{
    public function __construct(
        private readonly CreateBeneficiaryInHouseholdAction $createBeneficiary,
        private readonly PhoneFormatterService $phoneFormatter,
    ) {}

    public function __invoke(
        string $householdId,
        StoreHouseholdBeneficiaryRequest $request,
    ): RedirectResponse {
        try {
            $dto = CreateHouseholdBeneficiaryDto::fromArray(
                data: $request->validated(),
                householdId: $householdId,
                municipalId: app('municipal_id'),
                encodedByUserId: $request->user()->id,
                identityIdFront: $request->file('identity_id_front'),
                identityIdBack: $request->file('identity_id_back'),
                phoneFormatter: $this->phoneFormatter,
            );
            $beneficiary = $this->createBeneficiary->execute($dto);

            return redirect()
                ->route('actionCenter.admin.beneficiary.profile', [
                    'municipality' => app('current_municipality')->slug,
                    'beneficiaryId' => $beneficiary->id,
                ])
                ->with('success', 'Beneficiary registered in the household.');
        } catch (PotentialDuplicateBeneficiaryException $exception) {
            return back()
                ->withInput()
                ->withErrors([
                    'duplicate' => sprintf(
                        'Found %d existing record(s) with this name and birth date. Review them before registering another profile.',
                        $exception->matches->count(),
                    ),
                ])
                ->with(
                    'householdBeneficiaryDuplicateMatches',
                    WalkInBeneficiaryResource::collection($exception->matches)->resolve($request),
                );
        } catch (WalkInBeneficiaryIdentityDocumentStorageException $exception) {
            return redirect()
                ->route('actionCenter.admin.beneficiary.profile', [
                    'municipality' => app('current_municipality')->slug,
                    'beneficiaryId' => $exception->beneficiaryId(),
                ])
                ->with('error', $exception->getMessage());
        } catch (\DomainException $exception) {
            return back()->withInput()->withErrors(['beneficiary' => $exception->getMessage()]);
        }
    }
}
