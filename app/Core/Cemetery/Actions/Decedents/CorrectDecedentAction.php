<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Models\Decedent;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use BackedEnum;
use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CorrectDecedentAction
{
    private const EDITABLE_FIELDS = [
        'vital_record_type',
        'identity_status',
        'has_legal_name',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'memorial_name',
        'gender',
        'date_of_birth',
        'date_of_death',
        'registry_number',
        'cause_of_death',
        'place_of_death',
        'notes',
    ];

    private const UPPERCASE_FIELDS = [
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'memorial_name',
        'gender',
        'registry_number',
        'cause_of_death',
        'place_of_death',
    ];

    public function __construct(
        private GetDecedentReviewErrorsAction $getReviewErrors,
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(
        string $decedentId,
        string $municipalId,
        int $version,
        array $proposedChanges,
        string $reason,
        UploadedFile $evidence,
    ): Decedent {
        return DB::transaction(function () use (
            $decedentId,
            $municipalId,
            $version,
            $proposedChanges,
            $reason,
            $evidence,
        ) {
            $decedent = Decedent::query()
                ->with('unidentifiedDetail')
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->findOrFail($decedentId);

            if ($decedent->registration_status !== RegistrationStatus::VERIFIED) {
                throw ValidationException::withMessages([
                    'record' => 'Only verified records require an authorized correction.',
                ]);
            }

            if ($version !== $decedent->version) {
                throw ValidationException::withMessages([
                    'version' => 'This record was changed by another user. Reload it before correcting.',
                ]);
            }

            $changes = collect($proposedChanges)
                ->only(self::EDITABLE_FIELDS)
                ->map(fn ($value, $field) => $this->normalizeValue($field, $value))
                ->filter(fn ($value, $field) => $value !== $this->currentValue($decedent, $field))
                ->all();

            if ($changes === []) {
                throw ValidationException::withMessages([
                    'changes' => 'Provide at least one changed value.',
                ]);
            }

            $oldValues = collect(array_keys($changes))
                ->mapWithKeys(fn ($field) => [$field => $this->currentValue($decedent, $field)])
                ->all();

            $decedent->fill($changes);
            $decedent->decedent_type = $this->legacyType($decedent);
            $decedent->death_certificate_no = $decedent->vital_record_type === VitalRecordType::DEATH
                ? $decedent->registry_number
                : null;

            $errors = $this->getReviewErrors->execute($decedent);
            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }

            $correctionId = $this->idGenerator->generate();
            $decedent->version++;
            $decedent->disableLogging();
            $decedent->save();
            $decedent->enableLogging();

            $media = $decedent->addMedia($evidence)
                ->usingFileName($evidence->getClientOriginalName())
                ->withCustomProperties([
                    'correction_id' => $correctionId,
                    'reason' => trim($reason),
                    'old' => $oldValues,
                    'new' => $changes,
                    'version' => $decedent->version,
                    'corrected_by' => auth()->id(),
                ])
                ->toMediaCollection('correction_evidence', 'local');

            activity('cemetery_decedent')
                ->performedOn($decedent)
                ->causedBy(auth()->user())
                ->event('corrected')
                ->withChanges([
                    'attributes' => $changes,
                    'old' => $oldValues,
                ])
                ->withProperties([
                    'correction_id' => $correctionId,
                    'reason' => trim($reason),
                    'evidence_media_id' => $media->id,
                    'version' => $decedent->version,
                ])
                ->log('Verified decedent record corrected');

            return $decedent->fresh([
                'unidentifiedDetail',
                'media',
            ]);
        });
    }

    private function normalizeValue(string $field, mixed $value): mixed
    {
        if ($field === 'has_legal_name') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        if (! is_string($value)) {
            return $value;
        }

        $value = trim($value);
        if ($value === '') {
            return null;
        }

        return in_array($field, self::UPPERCASE_FIELDS, true)
            ? mb_strtoupper($value)
            : $value;
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

    private function legacyType(Decedent $decedent): string
    {
        if ($decedent->identity_status === IdentityStatus::UNIDENTIFIED) {
            return 'unknown';
        }

        return $decedent->vital_record_type === VitalRecordType::FETAL_DEATH
            ? 'fetal'
            : 'standard';
    }
}
