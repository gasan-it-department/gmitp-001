<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\DocumentVerificationStatus;
use App\Core\Cemetery\Models\DecedentDocument;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VerifyDecedentDocumentAction
{
    public function execute(string $documentId, string $decedentId, string $municipalId, bool $approved, ?string $notes): DecedentDocument
    {
        return DB::transaction(function () use ($documentId, $decedentId, $municipalId, $approved, $notes) {
            $document = DecedentDocument::query()
                ->where('municipal_id', $municipalId)
                ->where('decedent_id', $decedentId)
                ->lockForUpdate()
                ->findOrFail($documentId);

            if ($document->verification_status !== DocumentVerificationStatus::PENDING) {
                throw ValidationException::withMessages(['document' => 'Only pending documents can be reviewed.']);
            }

            $document->fill([
                'verification_status' => $approved
                    ? DocumentVerificationStatus::VERIFIED
                    : DocumentVerificationStatus::REJECTED,
                'verified_at' => now(),
                'verified_by' => auth()->id(),
                'verification_notes' => $notes,
            ])->save();

            if ($approved && $document->supersedes_id) {
                $superseded = DecedentDocument::query()
                    ->where('municipal_id', $municipalId)
                    ->where('decedent_id', $decedentId)
                    ->lockForUpdate()
                    ->findOrFail($document->supersedes_id);
                $superseded->forceFill([
                    'verification_status' => DocumentVerificationStatus::SUPERSEDED,
                ])->save();
            }

            return $document->fresh('verifier');
        });
    }
}
