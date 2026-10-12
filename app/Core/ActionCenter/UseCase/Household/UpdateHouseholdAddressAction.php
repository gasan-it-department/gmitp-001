<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\UpdateHouseholdAddressDto;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

final class UpdateHouseholdAddressAction
{
    public function __construct(private readonly LockActionCenterMunicipalityAction $lockMunicipality) {}

    public function execute(UpdateHouseholdAddressDto $dto): Household
    {
        return DB::transaction(function () use ($dto): Household {
            $municipality = $this->lockMunicipality->execute($dto->municipalId);
            $household = Household::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->householdId)
                ->lockForUpdate()
                ->firstOrFail();

            if (! hash_equals($household->addressFingerprint(), $dto->expectedFingerprint)) {
                throw new \DomainException('The household address changed. Refresh the page before saving your correction.');
            }

            $reason = trim($dto->reason);
            if (mb_strlen($reason) < 5 || mb_strlen($reason) > 500) {
                throw new \DomainException('Enter a correction reason between 5 and 500 characters.');
            }

            $barangay = $municipality?->psgc_municipal_id
                ? DB::table('psgc_barangays')
                    ->where('municipality_id', $municipality->psgc_municipal_id)
                    ->where('psgc_code', trim($dto->barangayCode))
                    ->first()
                : null;

            if ($barangay === null) {
                throw new \DomainException('Select a barangay belonging to this municipality.');
            }

            $street = trim($dto->street ?? '');
            if (mb_strlen($street) > 255) {
                throw new \DomainException('The street / purok / sitio must not exceed 255 characters.');
            }

            $before = $household->only(['barangay', 'barangay_psgc_code', 'street']);
            $after = ['barangay' => $barangay->name, 'barangay_psgc_code' => $barangay->psgc_code,
                'street' => $street === '' ? null : $street];

            if ($before === $after) {
                return $household;
            }

            $household->update($after);
            activity('household-address')
                ->performedOn($household)
                ->causedBy(User::findOrFail($dto->actingAdminId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'old' => $before,
                    'attributes' => $after,
                    'reason' => $reason,
                ])
                ->log('Corrected household address');

            return $household;
        }, attempts: 3);
    }
}
