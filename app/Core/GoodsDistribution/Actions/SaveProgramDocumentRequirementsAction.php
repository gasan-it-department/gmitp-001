<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramDocumentRequirement;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\GoodsDocumentCatalogService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;

final class SaveProgramDocumentRequirementsAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly DistributionRequestService $requests, private readonly GoodsDocumentCatalogService $catalog) {}

    public function execute(string $municipalId, string $actorId, string $programId, array $data): Program
    {
        $this->requests->actor($municipalId, $actorId, 'goods_distribution.inventory.manage');

        return DB::transaction(function () use ($municipalId, $actorId, $programId, $data) {
            $this->ledger->lockMunicipality($municipalId);
            $program = Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->firstOrFail();
            $before = ProgramDocumentRequirement::query()->where('municipal_id', $municipalId)->where('program_id', $programId)->orderBy('sort_order')->get();
            if ($this->requests->hash($before->map->only(['document_type_id', 'is_required', 'evidence_mode', 'physical_copy_requirement', 'sort_order'])->all()) !== $data['requirements_fingerprint']) {
                throw new \DomainException('Program requirements changed. Refresh before saving.');
            }
            $available = $this->catalog->available($municipalId)->keyBy('id');
            foreach ($data['requirements'] as $requirement) {
                if (! $available->has($requirement['document_type_id'])) {
                    throw new \DomainException('Select an active document category available to this municipality.');
                }
            }
            ProgramDocumentRequirement::query()->where('municipal_id', $municipalId)->where('program_id', $programId)->delete();
            foreach ($data['requirements'] as $index => $requirement) {
                ProgramDocumentRequirement::create([
                    'municipal_id' => $municipalId, 'program_id' => $programId, ...$requirement, 'sort_order' => $index,
                ]);
            }
            $this->ledger->audit($program, $actorId, 'Changed goods program document requirements', ['requirements' => $before->toArray()], ['requirements' => $data['requirements']]);

            return $program;
        });
    }
}
