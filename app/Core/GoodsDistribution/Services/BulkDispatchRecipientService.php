<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\BulkDispatchRecipient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class BulkDispatchRecipientService
{
    public function __construct(private readonly BulkDispatchAllocationService $allocations, private readonly StockQuantityService $quantities) {}

    public function schemaReady(): bool
    {
        return Schema::hasTable('gd_bulk_dispatch_recipients') && Schema::hasTable('gd_bulk_dispatch_recipient_lines')
            && Schema::hasColumns('gd_bulk_dispatch_recipients', ['first_name', 'middle_name', 'last_name', 'suffix']);
    }

    public function normalizeName(string $name): string
    {
        $name = \Normalizer::normalize($name, \Normalizer::FORM_KC) ?: $name;

        return trim(preg_replace('/\s+/u', ' ', preg_replace('/[^\p{L}\p{M}\p{N}]+/u', ' ', mb_strtolower($name))));
    }

    public function issuedLines(BulkDispatch $dispatch): mixed
    {
        return $dispatch->allLines()->whereIn('id', $dispatch->allocations()->where('status', 'issued')->select('bulk_dispatch_line_id'))->get();
    }

    public function coverage(BulkDispatch $dispatch): array
    {
        $reported = [];
        foreach ($this->allocations->balances($dispatch) as $row) {
            $reported[$row['line_id']] = ($reported[$row['line_id']] ?? 0) + $this->quantities->parse($row['reported_distributed'], $row['base_unit'], signed: true);
        }
        $recorded = DB::table('gd_bulk_dispatch_recipient_lines as line')
            ->join('gd_bulk_dispatch_recipients as person', 'person.id', '=', 'line.recipient_id')
            ->where('line.municipal_id', $dispatch->municipal_id)->where('line.bulk_dispatch_id', $dispatch->id)
            ->where('person.municipal_id', $dispatch->municipal_id)->where('person.bulk_dispatch_id', $dispatch->id)
            ->where('line.is_active', true)->where('person.status', 'active')
            ->select('line.bulk_dispatch_line_id')->selectRaw('SUM(line.quantity) as quantity')->groupBy('line.bulk_dispatch_line_id')->pluck('quantity', 'bulk_dispatch_line_id');

        return $this->issuedLines($dispatch)->map(function ($line) use ($reported, $recorded) {
            $total = $reported[$line->id] ?? 0;
            $documented = $this->quantities->parse((string) ($recorded[$line->id] ?? '0'), $line->base_unit);

            return ['bulk_dispatch_line_id' => $line->id, 'item_id' => $line->item_id, 'item_name' => $line->item_name_snapshot,
                'item_code' => $line->item_code_snapshot, 'base_unit' => $line->base_unit,
                'reported_distributed' => $this->quantities->format($total), 'recorded' => $this->quantities->format($documented),
                'without_details' => $this->quantities->format(max(0, $total - $documented)),
                'excess' => $this->quantities->format(max(0, $documented - $total)), 'needs_review' => $documented > $total];
        })->values()->all();
    }

    public function listing(BulkDispatch $dispatch, array $filters): mixed
    {
        $query = BulkDispatchRecipient::query()->where('municipal_id', $dispatch->municipal_id)->where('bulk_dispatch_id', $dispatch->id)->with('lines');
        if (! empty($filters['search'])) {
            $term = '%'.mb_strtolower($filters['search']).'%';
            $tokens = array_filter(explode(' ', $this->normalizeName($filters['search'])));
            $query->where(function ($q) use ($term, $tokens) {
                if ($tokens) {
                    $q->where(function ($name) use ($tokens) {
                        foreach ($tokens as $token) {
                            $name->where('normalized_name', 'like', '%'.$token.'%');
                        }
                    });
                }
                $q->orWhereRaw('LOWER(collector_name) LIKE ?', [$term])->orWhereRaw('LOWER(paper_reference) LIKE ?', [$term]);
            });
        }
        $query->when(! empty($filters['barangay']), fn ($q) => $q->where('barangay', $filters['barangay']))
            ->when(! empty($filters['recipient_status']), fn ($q) => $q->where('status', $filters['recipient_status']))
            ->when(! empty($filters['from']), fn ($q) => $q->whereDate('received_on', '>=', $filters['from']))
            ->when(! empty($filters['to']), fn ($q) => $q->whereDate('received_on', '<=', $filters['to']));
        if (($filters['quantity_details'] ?? '') === 'recorded') {
            $query->whereHas('lines');
        } elseif (($filters['quantity_details'] ?? '') === 'missing') {
            $query->whereDoesntHave('lines');
        }

        return $query->orderByDesc('created_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function candidates(BulkDispatch $dispatch, string $name, ?string $exclude = null): array
    {
        $normalized = $this->normalizeName($name);
        $tokens = array_filter(explode(' ', $normalized));
        if (! $tokens) {
            return [];
        }
        $query = BulkDispatchRecipient::query()->where('municipal_id', $dispatch->municipal_id)->where('bulk_dispatch_id', $dispatch->id)->where('status', 'active')
            ->when($exclude, fn ($q) => $q->where('id', '<>', $exclude));
        $query->where(function ($q) use ($tokens) {
            foreach ($tokens as $token) {
                $q->orWhere('normalized_name', 'like', '%'.$token.'%');
            }
        });

        return $query->orderBy('id')->get(['id', 'first_name', 'middle_name', 'last_name', 'suffix', 'normalized_name', 'barangay', 'received_on', 'paper_reference', 'paper_row'])
            ->filter(function ($person) use ($tokens) {
                $other = explode(' ', $person->normalized_name);

                return array_diff($tokens, $other) === [] || array_diff($other, $tokens) === [];
            })->take(5)->map(fn ($person) => ['id' => $person->id, 'full_name' => $person->full_name, 'barangay' => $person->barangay,
                'received_on' => $person->received_on?->toDateString(), 'paper_reference' => $person->paper_reference, 'paper_row' => $person->paper_row])->values()->all();
    }
}
