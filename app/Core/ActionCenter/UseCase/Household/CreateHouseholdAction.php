<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Beneficiary\GenerateBeneficiaryNumberAction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use DomainException;
use RuntimeException;

class CreateHouseholdAction
{
    public function execute(string $municipalId, string $barangay, ?string $street): Household
    {
        $municipality = DB::table('municipalities')
            ->where('id', $municipalId)
            ->first(['name', 'municipal_code']);

        if ($municipality === null) {
            throw new DomainException(
                'Cannot generate a household code: unknown municipality.',
            );
        }

        $prefix = GenerateBeneficiaryNumberAction::prefixFor($municipality->name, $municipality->municipal_code);

        // We use a simple loop in case of a highly unlikely 6-char random collision
        $attempts = 0;
        while ($attempts < 5) {
            // e.g. 8K4P2M
            $randomPart = strtoupper(Str::random(6));
            $householdCode = "HH-{$prefix}-{$randomPart}";

            // Ensure the code is strictly unique across all soft-deleted records as well
            $exists = Household::withTrashed()->where('household_code', $householdCode)->exists();
            if (! $exists) {
                return Household::create([
                    'municipal_id' => $municipalId,
                    'household_code' => $householdCode,
                    'barangay' => $barangay,
                    'street' => $street,
                ]);
            }
            $attempts++;
        }

        throw new RuntimeException('Failed to generate a unique household code after 5 attempts.');
    }
}
