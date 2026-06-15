<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Models\Decedent;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VerifyDecedentAction
{
    public function __construct(private GetDecedentReviewErrorsAction $getReviewErrors) {}

    public function execute(string $decedentId, string $municipalId): Decedent
    {
        return DB::transaction(function () use ($decedentId, $municipalId) {
            $decedent = Decedent::query()
                ->with(['unidentifiedDetail', 'fetalDeathDetail'])
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->findOrFail($decedentId);

            if ($decedent->registration_status !== RegistrationStatus::PENDING_REVIEW) {
                throw ValidationException::withMessages([
                    'record' => 'Only records pending review can be verified.',
                ]);
            }

            $errors = $this->getReviewErrors->execute($decedent);
            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }

            $decedent->forceFill([
                'registration_status' => RegistrationStatus::VERIFIED,
                'verified_at' => now(),
                'verified_by' => auth()->id(),
                'version' => $decedent->version + 1,
            ])->save();

            activity('cemetery_decedent')
                ->performedOn($decedent)
                ->causedBy(auth()->user())
                ->event('verified')
                ->withProperties(['version' => $decedent->version])
                ->log('Decedent registration verified');

            return $decedent->fresh();
        });
    }
}
