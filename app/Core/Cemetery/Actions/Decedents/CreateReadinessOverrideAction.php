<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\IntermentReadinessOverride;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateReadinessOverrideAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private GetIntermentReadinessAction $getReadiness,
    ) {}

    public function execute(string $decedentId, string $municipalId, string $reason, string $evidenceReference): IntermentReadinessOverride
    {
        return DB::transaction(function () use ($decedentId, $municipalId, $reason, $evidenceReference) {
            $decedent = Decedent::query()
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->findOrFail($decedentId);
            $readiness = $this->getReadiness->execute($decedent);

            if ($readiness['missing'] === []) {
                throw ValidationException::withMessages(['record' => 'This record has no missing readiness requirements.']);
            }

            if ($readiness['override'] !== null) {
                throw ValidationException::withMessages(['record' => 'This record already has a usable readiness override.']);
            }

            return IntermentReadinessOverride::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $municipalId,
                'decedent_id' => $decedentId,
                'missing_requirements' => $readiness['missing'],
                'reason' => trim($reason),
                'evidence_reference' => mb_strtoupper(trim($evidenceReference)),
                'expires_at' => now()->addDays(7),
                'created_by' => auth()->id(),
            ]);
        });
    }
}
