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

            if ($decedent->registration_status !== RegistrationStatus::DRAFT) {
                throw ValidationException::withMessages([
                    'record' => 'Only draft Decedent records can be deleted.',
                ]);
            }

            if ($decedent->interments()->exists() || $decedent->readinessOverrides()->exists()) {
                throw ValidationException::withMessages([
                    'record' => 'This draft has operational records and cannot be deleted.',
                ]);
            }

            $documentIds = $decedent->documents->pluck('id')->values()->all();

            activity('cemetery_decedent')
                ->performedOn($decedent)
                ->causedBy(auth()->user())
                ->event('draft_deleted')
                ->withProperties([
                    'reason' => trim($reason),
                    'version' => $decedent->version,
                    'document_ids' => $documentIds,
                    'unidentified_detail_id' => $decedent->unidentifiedDetail?->id,
                ])
                ->log('Draft Decedent record deleted');

            $decedent->documents->each->delete();
            $decedent->unidentifiedDetail?->delete();
            $decedent->delete();
        });
    }
}
