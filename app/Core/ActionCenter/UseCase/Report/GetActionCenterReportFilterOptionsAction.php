<?php

namespace App\Core\ActionCenter\UseCase\Report;

use App\Core\ActionCenter\Models\AssistanceRequestSnapshot;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Household;
use Illuminate\Database\Eloquent\Builder;

class GetActionCenterReportFilterOptionsAction
{
    public function execute(string $municipalId): array
    {
        return [
            'assistance_types' => AssistanceType::withTrashed()
                ->where('municipal_id', $municipalId)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (AssistanceType $type) => [
                    'value' => $type->id,
                    'label' => $type->name,
                ])
                ->values()
                ->all(),
            'request_barangays' => AssistanceRequestSnapshot::query()
                ->whereNotNull('barangay')
                ->whereHas('request', fn (Builder $query) => $query->where('municipal_id', $municipalId))
                ->distinct()
                ->orderBy('barangay')
                ->pluck('barangay')
                ->map(fn (string $barangay) => ['value' => $barangay, 'label' => $barangay])
                ->values()
                ->all(),
            'beneficiary_barangays' => Household::query()
                ->where('municipal_id', $municipalId)
                ->whereNotNull('barangay')
                ->distinct()
                ->orderBy('barangay')
                ->pluck('barangay')
                ->map(fn (string $barangay) => ['value' => $barangay, 'label' => $barangay])
                ->values()
                ->all(),
        ];
    }
}
