<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramDocumentRequirement;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockReceiptLine;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\GoodsDocumentCatalogService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\Schema;
use Spatie\Activitylog\Models\Activity;

final class ReadDistributionRequestsAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly GoodsDocumentCatalogService $documents, private readonly StockLedgerService $ledger) {}

    public function schemaReady(): bool
    {
        return Schema::hasTable('gd_distribution_stock_allocations') && Schema::hasColumn('gd_stock_movements', 'distribution_stock_allocation_id')
            && Schema::hasColumn('gd_distribution_document_checks', 'is_active') && Schema::hasTable('gd_distribution_cooldowns')
            && Schema::hasColumn('gd_programs', 'cooldown_enabled') && Schema::hasColumn('gd_distribution_requests', 'cooldown_exception_authorization');
    }

    public function listing(string $municipalId, array $filters): mixed
    {
        $query = DistributionRequest::query()->where('municipal_id', $municipalId);
        foreach (['program_id', 'status', 'beneficiary_id', 'household_id'] as $field) {
            if (! empty($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        if (! empty($filters['from'])) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }
        if (! empty($filters['to'])) {
            $query->whereDate('created_at', '<=', $filters['to']);
        }
        if (! empty($filters['search'])) {
            $term = '%'.mb_strtolower($filters['search']).'%';
            $query->where(fn ($q) => $q->whereRaw('LOWER(reference) LIKE ?', [$term])->orWhereRaw('LOWER(CAST(reviewed_snapshot AS TEXT)) LIKE ?', [$term]));
        }

        return $query->orderByDesc('created_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function options(string $municipalId): array
    {
        return [
            'programs' => Program::query()->where('municipal_id', $municipalId)->where('is_active', true)->orderBy('name')->get(['id', 'name'])->all(),
            'locations' => StorageLocation::query()->where('municipal_id', $municipalId)->where('is_active', true)->orderBy('name')->get(['id', 'name'])->all(),
        ];
    }

    public function recipients(string $municipalId, string $term): array
    {
        $query = Beneficiary::query()->where('municipal_id', $municipalId)->where('is_active', true)->whereNull('merged_into_beneficiary_id')->with('household.activeMembers');
        $words = preg_split('/\s+/', trim($term));
        foreach ($words as $word) {
            $like = '%'.mb_strtolower($word).'%';
            $query->where(fn ($q) => $q->whereRaw('LOWER(first_name) LIKE ?', [$like])
                ->orWhereRaw('LOWER(middle_name) LIKE ?', [$like])
                ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                ->orWhereRaw('LOWER(suffix) LIKE ?', [$like])
                ->orWhereRaw('LOWER(beneficiary_number) LIKE ?', [$like]));
        }

        return $query->orderBy('last_name')->limit(20)->get()->map(fn ($person) => $this->recipientData($person))->all();
    }

    private function recipientData(Beneficiary $person): array
    {
        return [
            'id' => $person->id, 'name' => $person->full_name, 'beneficiary_number' => $person->beneficiary_number,
            'birth_date' => $person->birth_date?->toDateString(), 'identity_verified' => $person->identity_verified_at !== null,
            'household_code' => $person->household?->household_code,
            'roster' => $person->household?->activeMembers->map(fn ($member) => ['id' => $member->id, 'beneficiary_id' => $member->beneficiary_id,
                'name' => trim(implode(' ', array_filter([$member->first_name, $member->middle_name, $member->last_name, $member->suffix])))])->values()->all() ?? [],
        ];
    }

    public function recipient(string $municipalId, string $id): array
    {
        $person = Beneficiary::query()->where('municipal_id', $municipalId)->whereKey($id)->with('household.activeMembers')->firstOrFail();

        return $this->recipientData($person);
    }

    public function items(string $municipalId, string $programId, string $search): mixed
    {
        Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->firstOrFail();

        return ProgramItem::query()->where('municipal_id', $municipalId)->where('program_id', $programId)->where('is_active', true)
            ->whereHas('item', fn ($q) => $q->where('is_active', true)->where(fn ($q) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%'])->orWhereRaw('LOWER(code) LIKE ?', ['%'.mb_strtolower($search).'%'])))
            ->with('item')->orderBy('id')->paginate(20);
    }

    public function requirements(string $municipalId, string $programId): array
    {
        Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->firstOrFail();
        $rows = ProgramDocumentRequirement::query()->where('municipal_id', $municipalId)->where('program_id', $programId)->orderBy('sort_order')->get()
            ->map->only(['document_type_id', 'is_required', 'evidence_mode', 'physical_copy_requirement', 'sort_order'])->all();
        $types = $this->documents->available($municipalId);
        $inactive = \App\Core\ActionCenter\Models\DocumentType::query()->availableToMunicipality($municipalId)
            ->whereIn('id', array_column($rows, 'document_type_id'))->whereNotIn('id', $types->pluck('id'))->get(['id', 'label']);

        return ['requirements' => $rows, 'requirements_fingerprint' => $this->requests->hash($rows),
            'document_types' => $types->map(fn ($type) => [...$type->toArray(), 'is_active' => true])
                ->concat($inactive->map(fn ($type) => [...$type->toArray(), 'is_active' => false]))->values()->all()];
    }

    public function detail(string $municipalId, string $id): DistributionRequest
    {
        $request = DistributionRequest::query()->where('municipal_id', $municipalId)->whereKey($id)->with(['lines', 'documentChecks', 'allocations'])->firstOrFail();
        $batches = StockReceiptLine::query()->where('municipal_id', $municipalId)->whereIn('id', $request->allocations->pluck('stock_receipt_line_id'))->with('receipt')->get()->keyBy('id');
        foreach ($request->allocations as $allocation) {
            $batch = $batches->get($allocation->stock_receipt_line_id);
            $allocation->setAttribute('batch_reference', $batch?->batch_reference);
            $allocation->setAttribute('receipt_reference', $batch?->receipt?->receipt_number);
            $allocation->setAttribute('item_name', $batch?->item_name_snapshot);
            $allocation->setAttribute('base_unit', $batch?->base_unit);
            $allocation->setAttribute('expires_on', $batch?->expires_on?->toDateString());
        }
        $request->setAttribute('program_name', Program::query()->where('municipal_id', $municipalId)->whereKey($request->program_id)->value('name'));
        $request->setAttribute('storage_name', StorageLocation::query()->where('municipal_id', $municipalId)->whereKey($request->storage_location_id)->value('name'));

        return $request;
    }

    public function history(DistributionRequest $request): mixed
    {
        return Activity::query()->where('subject_type', $request->getMorphClass())->where('subject_id', $request->id)
            ->with('causer')->orderByDesc('id')->paginate(20, ['*'], 'history_page')->withQueryString();
    }

    public function previous(DistributionRequest $request): mixed
    {
        return DistributionRequest::query()->where('municipal_id', $request->municipal_id)->where('household_id', $request->household_id)
            ->where('status', 'released')->where('id', '!=', $request->id)->orderByDesc('released_at')->limit(10)->get();
    }

    public function document(string $municipalId, string $requestId, string $checkId): mixed
    {
        $request = $this->detail($municipalId, $requestId);
        $check = $request->documentChecks->firstWhere('id', $checkId);
        abort_unless($check && $check->current_media_id, 404);

        return $request->media()->whereKey($check->current_media_id)->where('collection_name', 'goods_documents')->firstOrFail();
    }
}
