<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Activitylog\Models\Activity;

final class ReadBulkDispatchesAction
{
    public function __construct(private readonly BulkDispatchService $bulk) {}

    public function schemaReady(): bool
    {
        return Schema::hasTable('gd_bulk_dispatch_reconciliation_lines') && Schema::hasColumn('gd_stock_movements', 'bulk_dispatch_reconciliation_line_id')
            && Schema::hasColumn('gd_bulk_dispatches', 'purpose_notes');
    }

    public function listing(string $municipalId, array $filters): mixed
    {
        $query = BulkDispatch::query()->where('municipal_id', $municipalId)->with('lines');
        foreach (['program_id', 'status', 'custodian_type', 'purpose'] as $field) {
            $query->when(! empty($filters[$field]), fn ($query) => $query->where($field, $filters[$field]));
        }
        if (! empty($filters['barangay'])) {
            $query->whereJsonContains('destination_barangays', $filters['barangay']);
        }
        if (! empty($filters['from'])) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }
        if (! empty($filters['to'])) {
            $query->whereDate('created_at', '<=', $filters['to']);
        }
        if (! empty($filters['search'])) {
            $term = '%'.mb_strtolower($filters['search']).'%';
            $query->where(fn ($query) => $query->whereRaw('LOWER(reference) LIKE ?', [$term])->orWhereRaw('LOWER(custodian_name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(requester_name) LIKE ?', [$term])->orWhereRaw('LOWER(paper_reference) LIKE ?', [$term]));
        }

        return $query->orderByDesc('created_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function options(string $municipalId, bool $history = false): array
    {
        $options = app(ReadGoodsInventoryAction::class)->options($municipalId, includeInactive: $history, includeItems: false);
        unset($options['sources']);
        $options['custodian_types'] = BulkCustodianType::options();
        $options['purposes'] = BulkDispatchPurpose::options();
        $options['custodians'] = User::query()->where('municipal_id', $municipalId)->whereNull('deactivated_at')->orderBy('last_name')->get(['id', 'first_name', 'last_name'])
            ->map(fn ($user) => ['id' => $user->id, 'name' => trim($user->first_name.' '.$user->last_name)])->all();
        $municipality = Municipality::findOrFail($municipalId);
        $options['barangays'] = Schema::hasTable('psgc_barangays') && $municipality->psgc_municipal_id
            ? DB::table('psgc_barangays')->where('municipality_id', $municipality->psgc_municipal_id)->orderBy('name')->pluck('name')->all() : [];

        return $options;
    }

    public function items(string $municipalId, string $programId, string $search = ''): mixed
    {
        return Item::query()->where('municipal_id', $municipalId)->where('is_active', true)
            ->whereHas('programItems', fn ($query) => $query->where('municipal_id', $municipalId)->where('program_id', $programId)->where('is_active', true))
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%'])
                ->orWhereRaw('LOWER(code) LIKE ?', ['%'.mb_strtolower($search).'%'])))
            ->orderBy('name')->paginate(20)->withQueryString();
    }

    public function reconciliationHistory(BulkDispatch $dispatch): mixed
    {
        return $dispatch->reconciliations()->with(['lines.allocation.line', 'reversedEntry', 'reversal'])->orderByDesc('posted_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function history(BulkDispatch $dispatch): mixed
    {
        return Activity::query()->where('subject_type', $dispatch->getMorphClass())->where('subject_id', $dispatch->id)
            ->with('causer')->orderByDesc('id')->paginate(20)->withQueryString();
    }
}
