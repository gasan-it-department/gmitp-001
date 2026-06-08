<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;

/**
 * Admin-only: set / replace a beneficiary's profile photo.
 *
 * Captured during the interview (the officer takes a webcam shot on the PC and
 * uploads the file). The `avatar` collection is `singleFile()`, so adding a new
 * photo automatically removes the old one — exactly one current photo per
 * beneficiary.
 *
 * Tenant guard mirrors the other beneficiary actions: municipal_id lives on the
 * household, so a beneficiary from another LGU is rejected.
 *
 * Media I/O is intentionally NOT wrapped in a DB transaction — Spatie writes the
 * file to disk + a `media` row; there's nothing else to keep atomic. An explicit
 * activity entry records who changed the photo (the model's LogsActivity only
 * tracks identity columns, not media).
 */
class UploadBeneficiaryAvatarAction
{
    public function execute(
        string $beneficiaryId,
        UploadedFile $photo,
        string $municipalId,
        ?string $actingAdminId = null,
    ): Beneficiary {
        $beneficiary = Beneficiary::query()
            ->with('household:id,municipal_id')
            ->whereKey($beneficiaryId)
            ->firstOrFail();

        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException('You may only edit beneficiaries from your own municipality.');
        }

        $beneficiary
            ->addMedia($photo)
            ->usingFileName($this->safeFileName($beneficiary, $photo))
            ->toMediaCollection('avatar');

        $logger = activity('beneficiary')->performedOn($beneficiary);

        if ($actingAdminId !== null) {
            $logger->causedBy(\App\Core\Users\Models\User::find($actingAdminId));
        }

        $logger->log('Updated the profile photo');

        return $beneficiary->fresh();
    }

    /**
     * Deterministic, collision-free filename: the beneficiary's PK + the
     * original extension. Keeps the stored file readable in the admin's file
     * browser without leaking the citizen's name into the path.
     */
    private function safeFileName(Beneficiary $beneficiary, UploadedFile $photo): string
    {
        $extension = strtolower($photo->getClientOriginalExtension() ?: $photo->guessExtension() ?: 'jpg');

        return 'avatar-' . $beneficiary->getKey() . '.' . $extension;
    }
}
