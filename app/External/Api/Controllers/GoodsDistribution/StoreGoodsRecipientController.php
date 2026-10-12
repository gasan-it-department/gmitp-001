<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\ActionCenter\Dto\Beneficiary\CreateHouseholdBeneficiaryDto;
use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Exceptions\RegistrationIdentityCheckException;
use App\Core\ActionCenter\Exceptions\WalkInBeneficiaryIdentityDocumentStorageException;
use App\Core\GoodsDistribution\Actions\RegisterGoodsRecipientAction;
use App\External\Api\Request\ActionCenter\Household\StoreHouseholdBeneficiaryRequest;
use App\External\Api\Request\GoodsDistribution\StoreGoodsHouseholdHeadRequest;
use App\Http\Controllers\Controller;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\RedirectResponse;

final class StoreGoodsRecipientController extends Controller
{
    public function __construct(private readonly RegisterGoodsRecipientAction $register, private readonly PhoneFormatterService $phoneFormatter) {}

    public function head(StoreGoodsHouseholdHeadRequest $request): RedirectResponse
    {
        return $this->save(fn () => $this->register->head(CreateWalkInBeneficiaryDto::fromArray(
            $request->validated(), $request->user()->id, app('municipal_id'), $request->file('identity_id_front'), $request->file('identity_id_back'),
        ), $request->boolean('actual_household_head')));
    }

    public function member(string $householdId, StoreHouseholdBeneficiaryRequest $request): RedirectResponse
    {
        return $this->save(fn () => $this->register->member(CreateHouseholdBeneficiaryDto::fromArray(
            data: $request->validated(), householdId: $householdId, municipalId: app('municipal_id'), encodedByUserId: $request->user()->id,
            identityIdFront: $request->file('identity_id_front'), identityIdBack: $request->file('identity_id_back'),
            phoneFormatter: $this->phoneFormatter,
        )));
    }

    private function save(\Closure $create): RedirectResponse
    {
        try {
            $beneficiary = $create();

            return $this->selected($beneficiary->id)->with('success', 'Beneficiary registered. No goods handover has been recorded.');
        } catch (WalkInBeneficiaryIdentityDocumentStorageException $exception) {
            return $this->selected($exception->beneficiaryId())->with('error', $exception->getMessage());
        } catch (RegistrationIdentityCheckException $exception) {
            return back()->withInput()->withErrors(['registration_check' => $exception->getMessage()]);
        } catch (\DomainException $exception) {
            return back()->withInput()->withErrors(['beneficiary' => $exception->getMessage(), 'walkin' => $exception->getMessage()]);
        }
    }

    private function selected(string $beneficiaryId): RedirectResponse
    {
        return redirect()->route('goodsDistribution.recipients', [
            'municipality' => app('current_municipality')->slug, 'beneficiary_id' => $beneficiaryId,
        ]);
    }
}
