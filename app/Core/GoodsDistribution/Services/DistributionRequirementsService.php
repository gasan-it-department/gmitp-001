<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\ProgramDocumentRequirement;

final class DistributionRequirementsService
{
    public const FIELDS = ['document_key', 'label', 'description', 'is_required', 'evidence_mode', 'physical_copy_requirement', 'sort_order'];

    public function __construct(private readonly GoodsDocumentCatalogService $catalog, private readonly DistributionRequestService $requests) {}

    public function preview(DistributionRequest $request): array
    {
        $types = $this->catalog->available($request->municipal_id)->keyBy('id');
        $requirements = [];
        foreach (ProgramDocumentRequirement::query()->where('municipal_id', $request->municipal_id)
            ->where('program_id', $request->program_id)->orderBy('sort_order')->orderBy('id')->get() as $requirement) {
            $type = $types->get($requirement->document_type_id);
            if (! $type) {
                return ['changed' => false, 'fingerprint' => null, 'changes' => [], 'requirements' => [],
                    'error' => 'A program requirement uses an unavailable document type. Update the program requirements before applying them.'];
            }
            $requirements[] = ['document_key' => $type->key, 'label' => $type->label, 'description' => $type->description,
                'is_required' => $requirement->is_required, 'evidence_mode' => $requirement->evidence_mode,
                'physical_copy_requirement' => $requirement->physical_copy_requirement, 'sort_order' => $requirement->sort_order];
        }
        $checks = $request->documentChecks()->get()->keyBy('document_key');
        $changes = [];
        foreach ($requirements as $next) {
            $check = $checks->get($next['document_key']);
            $before = $check?->only(self::FIELDS);
            if (! $check || ! $check->is_active || $before !== $next) {
                $changes[] = ['document_key' => $next['document_key'], 'label' => $next['label'],
                    'kind' => ! $check ? 'added' : (! $check->is_active ? 'restored' : 'updated'),
                    'before' => $before, 'after' => $next,
                    'resets_inspection' => $check && (! $check->is_active || $check->evidence_mode !== $next['evidence_mode']
                        || $check->physical_copy_requirement !== $next['physical_copy_requirement'])];
            }
        }
        $keys = array_column($requirements, 'document_key');
        foreach ($checks as $check) {
            if ($check->is_active && ! in_array($check->document_key, $keys, true)) {
                $changes[] = ['document_key' => $check->document_key, 'label' => $check->label, 'kind' => 'removed',
                    'before' => $check->only(self::FIELDS), 'after' => null, 'resets_inspection' => false];
            }
        }

        return ['changed' => count($changes) > 0, 'fingerprint' => $this->requests->hash($requirements),
            'changes' => $changes, 'requirements' => $requirements, 'error' => null];
    }
}
