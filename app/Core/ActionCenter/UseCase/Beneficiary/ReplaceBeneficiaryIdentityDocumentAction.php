<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;

class ReplaceBeneficiaryIdentityDocumentAction
{
    public function execute(
        string $beneficiaryId,
        string $side,
        UploadedFile $document,
        string $municipalId,
        ?string $actingAdminId = null,
        ?string $reason = null,
    ): Beneficiary {
        $collection = match ($side) {
            'front' => 'identity_id_front',
            'back' => 'identity_id_back',
            default => throw new InvalidArgumentException('Invalid identity document side.'),
        };

        $beneficiary = Beneficiary::query()
            ->with('household:id,municipal_id')
            ->whereKey($beneficiaryId)
            ->firstOrFail();

        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException('You may only edit beneficiaries from your own municipality.');
        }

        $beneficiary
            ->addMedia($document)
            ->usingFileName($this->safeFileName($beneficiary, $side, $document))
            ->toMediaCollection($collection);

        $logger = activity('beneficiary')
            ->performedOn($beneficiary)
            ->withProperties([
                'side' => $side,
                'reason' => $reason,
                'municipal_id' => $municipalId,
            ]);

        if ($actingAdminId !== null) {
            $logger->causedBy(User::find($actingAdminId));
        }

        $logger->log('Replaced beneficiary identity document');

        return $beneficiary->fresh();
    }

    private function safeFileName(Beneficiary $beneficiary, string $side, UploadedFile $document): string
    {
        $extension = strtolower($document->getClientOriginalExtension() ?: $document->guessExtension() ?: 'pdf');

        return 'identity-id-' . $side . '-' . $beneficiary->getKey() . '.' . $extension;
    }
}
