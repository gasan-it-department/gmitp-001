<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use Spatie\Activitylog\Models\Activity;

class GetDecedentProfileAction
{
    public function execute(string $decedentId, string $municipalId): Decedent
    {
        $decedent = Decedent::with([
            'currentInterment.plot.block.section',
            'currentInterment.plot.parent',
            'documents.media',
            'documents.verifier',
            'unidentifiedDetail',
            'fetalDeathDetail',
            'corrections.requester',
            'corrections.reviewer',
            'corrections.media',
            'readinessOverrides',
            'verifier',
            'submitter',
            'media',
        ])->where('municipal_id', $municipalId)->findOrFail($decedentId);

        $documentIds = DecedentDocument::withTrashed()
            ->where('municipal_id', $municipalId)
            ->where('decedent_id', $decedent->id)
            ->pluck('id');

        $subjectIds = collect([$decedent->id])
            ->merge($documentIds)
            ->merge($decedent->corrections->pluck('id'))
            ->merge($decedent->readinessOverrides->pluck('id'))
            ->when($decedent->unidentifiedDetail, fn ($ids) => $ids->push($decedent->unidentifiedDetail->id))
            ->when($decedent->fetalDeathDetail, fn ($ids) => $ids->push($decedent->fetalDeathDetail->id));

        $activities = Activity::query()
            ->with('causer')
            ->whereIn('subject_id', $subjectIds->filter()->values())
            ->where('log_name', 'like', 'cemetery_%')
            ->latest()
            ->limit(100)
            ->get();

        return $decedent->setRelation('auditActivities', $activities);
    }
}
