<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\CorrectionStatus;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentCorrection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewDecedentCorrectionAction
{
    public function __construct(private GetDecedentReviewErrorsAction $getReviewErrors) {}

    public function execute(
        string $correctionId,
        string $decedentId,
        string $municipalId,
        bool $approved,
        ?string $reviewNotes,
    ): DecedentCorrection {
        return DB::transaction(function () use ($correctionId, $decedentId, $municipalId, $approved, $reviewNotes) {
            $correction = DecedentCorrection::query()
                ->where('municipal_id', $municipalId)
                ->where('decedent_id', $decedentId)
                ->lockForUpdate()
                ->findOrFail($correctionId);

            if ($correction->status !== CorrectionStatus::PENDING) {
                throw ValidationException::withMessages(['correction' => 'This correction was already reviewed.']);
            }

            $correction->fill([
                'status' => $approved ? CorrectionStatus::APPROVED : CorrectionStatus::REJECTED,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'review_notes' => $reviewNotes,
            ]);

            if ($approved) {
                $decedent = Decedent::query()
                    ->where('municipal_id', $municipalId)
                    ->lockForUpdate()
                    ->findOrFail($decedentId);

                if ($decedent->version !== $correction->base_version) {
                    throw ValidationException::withMessages([
                        'correction' => 'The decedent changed after this correction was requested. Submit a new correction.',
                    ]);
                }

                $changes = $this->normalize($correction->proposed_changes);
                $decedent->fill($changes);
                $decedent->decedent_type = $this->legacyType($decedent, $changes);

                $errors = $this->getReviewErrors->execute($decedent);
                if ($errors !== []) {
                    throw ValidationException::withMessages($errors);
                }

                $decedent->version++;
                $decedent->save();

                $correction->applied_at = now();

                activity('cemetery_decedent')
                    ->performedOn($decedent)
                    ->causedBy(auth()->user())
                    ->event('correction_applied')
                    ->withProperties([
                        'correction_id' => $correction->id,
                        'reason' => $correction->reason,
                        'old' => $correction->original_values,
                        'new' => $changes,
                    ])
                    ->log('Approved correction applied');
            }

            $correction->save();

            return $correction->fresh(['requester', 'reviewer']);
        });
    }

    private function normalize(array $changes): array
    {
        foreach (['first_name', 'last_name', 'middle_name', 'suffix', 'memorial_name', 'gender', 'registry_number', 'cause_of_death', 'place_of_death'] as $field) {
            if (isset($changes[$field]) && is_string($changes[$field])) {
                $changes[$field] = mb_strtoupper(trim($changes[$field]));
            }
        }

        return $changes;
    }

    private function legacyType(Decedent $decedent, array $changes): string
    {
        $identity = $changes['identity_status'] ?? $decedent->identity_status->value;
        $vital = $changes['vital_record_type'] ?? $decedent->vital_record_type->value;

        if ($identity === IdentityStatus::UNIDENTIFIED->value) {
            return 'unknown';
        }

        return $vital === VitalRecordType::FETAL_DEATH->value ? 'fetal' : 'standard';
    }
}
