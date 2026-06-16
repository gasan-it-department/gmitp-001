<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class RejectBeneficiaryIntakeAction
{
    public function execute(
        string $beneficiaryId,
        string $municipalId,
        string $actingAdminId,
        string $reason,
    ): Beneficiary {
        return DB::transaction(function () use ($beneficiaryId, $municipalId, $actingAdminId, $reason) {
            $beneficiary = Beneficiary::query()
                ->with('household')
                ->whereKey($beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($beneficiary->municipal_id !== $municipalId) {
                throw new AuthorizationException(
                    'You may only reject beneficiary intakes from your own municipality.',
                );
            }

            if ($beneficiary->merged_into_beneficiary_id !== null) {
                throw new \DomainException('This record was already merged into another beneficiary.');
            }

            if ($beneficiary->user_id === null) {
                throw new \DomainException('Only portal-submitted beneficiary intakes can be rejected here.');
            }

            if ($beneficiary->isIdentityVerified()) {
                throw new \DomainException('This beneficiary intake has already been verified.');
            }

            if ($beneficiary->isIntakeRejected()) {
                throw new \DomainException('This beneficiary intake has already been rejected.');
            }

            $beneficiary->update([
                'identity_verified_at' => null,
                'identity_verified_by_user_id' => null,
                'intake_rejected_at' => now(),
                'intake_rejected_by_user_id' => $actingAdminId,
                'intake_rejection_reason' => trim($reason),
            ]);

            activity('beneficiary-intake')
                ->performedOn($beneficiary)
                ->causedBy(User::find($actingAdminId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'reason' => trim($reason),
                ])
                ->log('Rejected beneficiary intake');

            return $beneficiary->fresh(['household', 'intakeRejector']);
        }, attempts: 3);
    }
}
