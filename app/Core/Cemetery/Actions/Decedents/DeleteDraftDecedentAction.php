<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Models\Decedent;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteDraftDecedentAction
{
    public function execute(string $decedentId, string $municipalId, string $reason): void
    {
        DB::transaction(function () use ($decedentId, $municipalId, $reason) {
            $decedent = Decedent::query()
                ->with(['documents', 'unidentifiedDetail'])
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->findOrFail($decedentId);

            $deletableStatuses = [
                RegistrationStatus::DRAFT,
                RegistrationStatus::PENDING_REVIEW,
            ];

            if (! in_array($decedent->registration_status, $deletableStatuses, true)) {
                throw ValidationException::withMessages([
                    'record' => 'Only draft or pending-review Decedent records can be deleted.',
                ]);
            }

            if ($decedent->interments()->exists() || $decedent->readinessOverrides()->exists()) {
                throw ValidationException::withMessages([
                    'record' => 'This unverified record has operational records and cannot be deleted.',
                ]);
            }

            $documentIds = $decedent->documents->pluck('id')->values()->all();

            activity('cemetery_decedent')
                ->performedOn($decedent)
                ->causedBy(auth()->user())
                ->event('unverified_deleted')
                ->withProperties([
                    'reason' => trim($reason),
                    'registration_status' => $decedent->registration_status->value,
                    'version' => $decedent->version,
                    'document_ids' => $documentIds,
                    'unidentified_detail_id' => $decedent->unidentifiedDetail?->id,
                ])
                ->log('Unverified Decedent record deleted');

            $decedent->documents->each->delete();
            $decedent->unidentifiedDetail?->delete();
            $decedent->delete();
        });
    }
}
