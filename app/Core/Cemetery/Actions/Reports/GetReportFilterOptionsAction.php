<?php

namespace App\Core\Cemetery\Actions\Reports;

use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Section;

class GetReportFilterOptionsAction
{
    public function execute(string $municipalId): array
    {
        return [
            'sites' => CemeterySite::query()
                ->where('municipal_id', $municipalId)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (CemeterySite $site) => ['value' => $site->id, 'label' => $site->name])
                ->values()
                ->all(),
            'sections' => Section::query()
                ->where('municipal_id', $municipalId)
                ->orderBy('name')
                ->get(['id', 'cemetery_site_id', 'name'])
                ->map(fn (Section $section) => [
                    'value' => $section->id,
                    'label' => $section->name,
                    'site_id' => $section->cemetery_site_id,
                ])
                ->values()
                ->all(),
            'blocks' => Block::query()
                ->where('municipal_id', $municipalId)
                ->with('section:id,cemetery_site_id')
                ->orderBy('name')
                ->get(['id', 'section_id', 'name'])
                ->map(fn (Block $block) => [
                    'value' => $block->id,
                    'label' => $block->name,
                    'section_id' => $block->section_id,
                    'site_id' => $block->section?->cemetery_site_id,
                ])
                ->values()
                ->all(),
        ];
    }
}
