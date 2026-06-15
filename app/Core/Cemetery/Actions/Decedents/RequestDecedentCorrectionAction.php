<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\CorrectionStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentCorrection;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use BackedEnum;
use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RequestDecedentCorrectionAction
{
    private const EDITABLE_FIELDS = [
        'vital_record_type', 'identity_status', 'has_legal_name', 'first_name',
        'last_name', 'middle_name', 'suffix', 'memorial_name', 'gender',
        'date_of_birth', 'date_of_death', 'registry_number', 'cause_of_death',
        'place_of_death', 'notes',
    ];

    public function __construct(private IdGeneratorInterface $idGenerator) {}

    public function execute(
        string $decedentId,
        string $municipalId,
        array $proposedChanges,
        string $reason,
        UploadedFile $evidence,
    ): DecedentCorrection {
        return DB::transaction(function () use ($decedentId, $municipalId, $proposedChanges, $reason, $evidence) {
            $decedent = Decedent::query()
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->findOrFail($decedentId);

            if ($decedent->registration_status !== RegistrationStatus::VERIFIED) {
                throw ValidationException::withMessages(['record' => 'Only verified records use the correction workflow.']);
            }

            if (DecedentCorrection::query()
                ->where('municipal_id', $municipalId)
                ->where('decedent_id', $decedentId)
                ->where('status', CorrectionStatus::PENDING->value)
                ->exists()) {
                throw ValidationException::withMessages(['record' => 'Review the existing pending correction first.']);
            }

            $changes = collect($proposedChanges)
                ->only(self::EDITABLE_FIELDS)
                ->map(function ($value, $field) {
                    if ($field === 'has_legal_name') {
                        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    }

                    return is_string($value) ? (trim($value) === '' ? null : trim($value)) : $value;
                })
                ->filter(fn ($value, $field) => $value !== $this->currentValue($decedent, $field))
                ->all();

            if ($changes === []) {
                throw ValidationException::withMessages(['proposed_changes' => 'Provide at least one changed value.']);
            }

            $correction = DecedentCorrection::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $municipalId,
                'decedent_id' => $decedentId,
                'base_version' => $decedent->version,
                'original_values' => collect(array_keys($changes))
                    ->mapWithKeys(fn ($field) => [$field => $this->currentValue($decedent, $field)])
                    ->all(),
                'proposed_changes' => $changes,
                'reason' => trim($reason),
                'status' => CorrectionStatus::PENDING->value,
                'requested_by' => auth()->id(),
            ]);

            $correction->addMedia($evidence)
                ->usingFileName($evidence->getClientOriginalName())
                ->toMediaCollection('evidence', 'local');

            return $correction->fresh(['requester', 'media']);
        });
    }

    private function currentValue(Decedent $decedent, string $field): mixed
    {
        $value = $decedent->getAttribute($field);

        return match (true) {
            $value instanceof BackedEnum => $value->value,
            $value instanceof DateTimeInterface => $value->format('Y-m-d'),
            default => $value,
        };
    }
}
