<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Spatie\MediaLibrary\Conversions\FileManipulator;
use Throwable;

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

        if (! in_array($document->getMimeType(), ['image/jpeg', 'image/png', 'application/pdf'], true)) {
            throw new InvalidArgumentException('The identity document must be a JPG, PNG, or PDF file.');
        }

        // Do not invoke the single-file collection's destructive replacement
        // until both the uploaded source and the database changes are ready.
        $replacement = $beneficiary
            ->addMedia($document)
            ->usingFileName($this->safeFileName($beneficiary, $side, $document))
            ->toMediaCollection($collection.'_replacement');

        try {
            DB::transaction(function () use ($beneficiaryId, $collection, $replacement, $side, $municipalId, $actingAdminId, $reason) {
                $locked = Beneficiary::query()->whereKey($beneficiaryId)->lockForUpdate()->firstOrFail();

                if ($locked->household?->municipal_id !== $municipalId) {
                    throw new AuthorizationException('You may only edit beneficiaries from your own municipality.');
                }

                $oldDocuments = $locked->getMedia($collection);
                $previousVerifiedAt = $locked->identity_verified_at?->toIso8601String();
                $previousVerifierId = $locked->identity_verified_by_user_id;

                // Retire old media in the database first, but keep its files
                // until commit so any conversion/save/audit failure is safe.
                foreach ($oldDocuments as $oldDocument) {
                    $oldDocument->update(['collection_name' => $collection.'_replaced']);
                }
                $replacement->update(['collection_name' => $collection]);
                app(FileManipulator::class)->createDerivedFiles($replacement);
                $locked->update([
                    'identity_verified_at' => null,
                    'identity_verified_by_user_id' => null,
                ]);

                $logger = activity('beneficiary')
                    ->performedOn($locked)
                    ->withProperties([
                        'side' => $side,
                        'reason' => $reason,
                        'municipal_id' => $municipalId,
                        'old_media_ids' => $oldDocuments->modelKeys(),
                        'new_media_id' => $replacement->id,
                        'identity_verification_reset' => $previousVerifiedAt !== null,
                        'previous_identity_verified_at' => $previousVerifiedAt,
                        'previous_identity_verified_by_user_id' => $previousVerifierId,
                    ]);

                if ($actingAdminId !== null) {
                    $logger->causedBy(User::find($actingAdminId));
                }

                $logger->log('Replaced beneficiary identity document');

                DB::afterCommit(function () use ($oldDocuments) {
                    foreach ($oldDocuments as $oldDocument) {
                        try {
                            $oldDocument->delete();
                        } catch (Throwable $exception) {
                            // A cleanup failure must not undo the committed
                            // replacement or make the new upload look failed.
                            report($exception);
                        }
                    }
                });
            });
        } catch (Throwable $exception) {
            try {
                $replacement->delete();
            } catch (Throwable $cleanupException) {
                report($cleanupException);
            }

            throw $exception;
        }

        return $beneficiary->fresh();
    }

    private function safeFileName(Beneficiary $beneficiary, string $side, UploadedFile $document): string
    {
        $extension = strtolower($document->getClientOriginalExtension() ?: $document->guessExtension() ?: 'pdf');

        return 'identity-id-'.$side.'-'.$beneficiary->getKey().'.'.$extension;
    }
}
