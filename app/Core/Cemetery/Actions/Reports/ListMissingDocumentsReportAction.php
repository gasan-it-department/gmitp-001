<?php

namespace App\Core\Cemetery\Actions\Reports;

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Dto\Reports\MissingDocumentsReportFiltersDto;
use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Models\Decedent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Collection;

class ListMissingDocumentsReportAction
{
    public function __construct(private GetIntermentReadinessAction $getIntermentReadiness) {}

    public function execute(string $municipalId, MissingDocumentsReportFiltersDto $filters): LengthAwarePaginator
    {
        return $this->paginateRows(collect($this->rowsForExport($municipalId, $filters)), $filters->perPage);
    }

    public function rowsForExport(string $municipalId, MissingDocumentsReportFiltersDto $filters): array
    {
        return $this->baseQuery($municipalId, $filters)
            ->get()
            ->map(fn (Decedent $decedent) => $this->mapRow($decedent))
            ->filter(fn (array $row) => $row['missing_documents'] !== [])
            ->when($filters->missingDocumentType, fn (Collection $rows, string $type) => $rows
                ->filter(fn (array $row) => in_array($type, $row['missing_document_types'], true)))
            ->values()
            ->all();
    }

    public function summary(string $municipalId, MissingDocumentsReportFiltersDto $filters): array
    {
        $rows = collect($this->rowsForExport($municipalId, $filters));

        return [
            'total' => $rows->count(),
            'interred' => $rows->where('interment_status', 'interred')->count(),
            'unassigned' => $rows->where('interment_status', 'unassigned')->count(),
            'authorized' => $rows->filter(fn (array $row) => filled($row['pending_document_reason']))->count(),
        ];
    }

    public function headings(): array
    {
        return [
            'Decedent',
            'Registry Number',
            'Vital Record Type',
            'Death Date',
            'Interment Status',
            'Location',
            'Missing Documents',
            'Pending Document Reason',
            'Pending Document Reference',
        ];
    }

    public function exportRows(string $municipalId, MissingDocumentsReportFiltersDto $filters): array
    {
        return collect($this->rowsForExport($municipalId, $filters))
            ->map(fn (array $row) => [
                $row['decedent_name'],
                $row['registry_number'],
                $row['vital_record_type_label'],
                $row['date_of_death'],
                $row['interment_status_label'],
                $row['location_label'],
                $row['missing_documents_label'],
                $row['pending_document_reason'],
                $row['pending_document_reference'],
            ])
            ->all();
    }

    private function baseQuery(string $municipalId, MissingDocumentsReportFiltersDto $filters): Builder
    {
        return Decedent::query()
            ->with([
                'documents',
                'unidentifiedDetail',
                'readinessOverrides',
                'currentInterment.plot.cemeterySite',
                'currentInterment.plot.block.section',
                'latestInterment.plot.cemeterySite',
                'latestInterment.plot.block.section',
            ])
            ->where('municipal_id', $municipalId)
            ->when($filters->registrationStatus, fn (Builder $query, string $status) => $query->where('registration_status', $status))
            ->when($filters->vitalRecordType, fn (Builder $query, string $type) => $query->where('vital_record_type', $type))
            ->when($filters->intermentStatus, fn (Builder $query, string $status) => $this->applyIntermentStatus($query, $status))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('memorial_name');
    }

    private function applyIntermentStatus(Builder $query, string $status): void
    {
        if ($status === 'interred') {
            $query->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery->active());

            return;
        }

        $query->whereDoesntHave('interments', fn (Builder $intermentQuery) => $intermentQuery->active());

        if (in_array($status, ['exhumed', 'transferred_out'], true)) {
            $query->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery
                ->where('end_type', $status)
                ->whereNotNull('ended_at')
                ->whereNull('voided_at'));

            return;
        }

        $query->whereDoesntHave('interments', fn (Builder $intermentQuery) => $intermentQuery
            ->whereIn('end_type', ['exhumed', 'transferred_out'])
            ->whereNotNull('ended_at')
            ->whereNull('voided_at'));
    }

    private function mapRow(Decedent $decedent): array
    {
        $readiness = $this->getIntermentReadiness->execute($decedent);
        $missingTypes = $readiness['missing'];
        $missingDocuments = collect($missingTypes)
            ->map(fn (string $type) => [
                'type' => $type,
                'label' => DecedentDocumentType::tryFrom($type)?->label() ?? str($type)->replace('_', ' ')->title()->toString(),
            ])
            ->values()
            ->all();
        $authorization = $decedent->readinessOverrides->sortByDesc('created_at')->first();
        $intermentStatus = $this->intermentStatus($decedent);

        return [
            'decedent_id' => $decedent->id,
            'decedent_name' => $this->displayName($decedent),
            'registry_number' => $decedent->registry_number,
            'vital_record_type' => $decedent->vital_record_type?->value,
            'vital_record_type_label' => $decedent->vital_record_type?->label(),
            'date_of_death' => $decedent->date_of_death?->format('Y-m-d'),
            'interment_status' => $intermentStatus,
            'interment_status_label' => str($intermentStatus)->replace('_', ' ')->title()->toString(),
            'location_label' => $this->locationLabel($decedent),
            'missing_document_types' => $missingTypes,
            'missing_documents' => $missingDocuments,
            'missing_documents_label' => collect($missingDocuments)->pluck('label')->implode(', '),
            'pending_document_reason' => $authorization?->reason,
            'pending_document_reference' => $authorization?->evidence_reference,
        ];
    }

    private function intermentStatus(Decedent $decedent): string
    {
        if ($decedent->currentInterment) {
            return 'interred';
        }

        return match ($decedent->latestInterment?->end_type) {
            'exhumed' => 'exhumed',
            'transferred_out' => 'transferred_out',
            default => 'unassigned',
        };
    }

    private function locationLabel(Decedent $decedent): ?string
    {
        $interment = $decedent->currentInterment ?: $decedent->latestInterment;
        $plot = $interment?->plot;

        if (! $plot) {
            return null;
        }

        return collect([
            $plot->cemeterySite?->name,
            $plot->block?->section?->name,
            $plot->block?->name,
            $plot->slotLabel,
        ])->filter()->implode(' / ');
    }

    private function displayName(Decedent $decedent): string
    {
        if ($decedent->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($decedent->unidentifiedDetail?->case_reference ?? $decedent->id);
        }

        if (! $decedent->has_legal_name && filled($decedent->memorial_name)) {
            return $decedent->memorial_name;
        }

        return trim(sprintf('%s, %s %s', $decedent->last_name ?? '', $decedent->first_name ?? '', $decedent->suffix ?? ''));
    }

    private function paginateRows(Collection $rows, int $perPage): LengthAwarePaginator
    {
        $page = Paginator::resolveCurrentPage();

        return new Paginator(
            $rows->forPage($page, $perPage)->values(),
            $rows->count(),
            $perPage,
            $page,
            [
                'path' => Paginator::resolveCurrentPath(),
                'query' => request()->query(),
            ],
        );
    }
}
