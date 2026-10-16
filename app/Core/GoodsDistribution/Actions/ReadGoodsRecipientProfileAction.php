<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\DistributionRequestLine;
use App\Core\GoodsDistribution\Models\Program;
use Illuminate\Database\Eloquent\Builder;

final class ReadGoodsRecipientProfileAction
{
    public function execute(string $municipalId, array $identity, array $filters): array
    {
        $tab = $filters['tab'] ?? 'overview';
        $related = $this->query($municipalId, $identity, 'all');
        $programIds = (clone $related)->distinct()->pluck('program_id');
        $options = Program::query()->where('municipal_id', $municipalId)->whereIn('id', $programIds)->orderBy('name')->get(['id', 'name', 'is_active'])->toArray();
        if ($tab === 'overview') {
            $received = $this->query($municipalId, $identity, 'recipient')->where('status', 'released');

            return ['programs' => $options, 'summary' => ['released_count' => (clone $received)->count(),
                'latest_handover_on' => (clone $received)->max('actual_release_on')]];
        }
        $received = $tab === 'received';
        $query = $this->query($municipalId, $identity, $received ? 'recipient' : ($filters['role'] ?? 'all'));
        if ($received) {
            $query->where('status', 'released');
        } elseif (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }
        $date = $received ? 'actual_release_on' : 'created_at';
        foreach (['from' => '>=', 'to' => '<='] as $field => $operator) {
            if (! empty($filters[$field])) {
                $query->whereDate($date, $operator, $filters[$field]);
            }
        }
        $totals = [];
        if ($received) {
            $totals = DistributionRequestLine::query()->where('gd_distribution_request_lines.municipal_id', $municipalId)->where('is_active', true)
                ->whereIn('distribution_request_id', (clone $query)->select('id'))
                ->join('gd_distribution_requests as requests', 'requests.id', '=', 'gd_distribution_request_lines.distribution_request_id')
                ->selectRaw('requests.program_id, gd_distribution_request_lines.item_id, gd_distribution_request_lines.base_unit, SUM(gd_distribution_request_lines.quantity) as quantity')
                ->selectRaw('MAX(requests.program_name_snapshot) as program_name, MAX(gd_distribution_request_lines.item_name_snapshot) as item_name')
                ->groupBy('requests.program_id', 'gd_distribution_request_lines.item_id', 'gd_distribution_request_lines.base_unit')
                ->orderBy('program_name')->orderBy('item_name')->get()->map(fn ($row) => [
                    'program_id' => $row->program_id, 'program_name' => $row->program_name, 'item_id' => $row->item_id,
                    'item_name' => $row->item_name, 'base_unit' => $row->base_unit, 'quantity' => (string) $row->quantity,
                ])->all();
        }
        $records = $query->with('lines')->orderByDesc($date)->orderByDesc('id')->paginate(20)->withQueryString();
        $records->through(function ($request) use ($identity) {
            $snapshot = $request->status->value === 'released' ? ($request->handover_snapshot ?? $request->reviewed_snapshot) : $request->reviewed_snapshot;
            $filer = in_array($request->beneficiary_id, $identity['beneficiary_ids'], true);
            $subjectBeneficiaryId = $snapshot['subject']['beneficiary_id'] ?? null;
            $recipient = $request->assisted_household_member_id === null ? $filer
                : ($subjectBeneficiaryId !== null ? in_array($subjectBeneficiaryId, $identity['beneficiary_ids'], true)
                    : in_array($request->assisted_household_member_id, $identity['member_ids'], true));

            return [
                'id' => $request->id, 'reference' => $request->reference, 'status' => $request->status->value,
                'program_name' => $request->program_name_snapshot, 'created_at' => $request->created_at->toIso8601String(),
                'actual_release_on' => $request->actual_release_on?->toDateString(),
                'role' => $recipient && $filer ? 'both' : ($recipient ? 'recipient' : 'filer'),
                'recipient_name' => $snapshot['subject']['name'] ?? null, 'filer_name' => $snapshot['filer']['name'] ?? null,
                'household_code' => $snapshot['household_code'] ?? null, 'barangay' => $snapshot['barangay'] ?? null,
                'collector_name' => $request->status->value === 'released' ? $request->collector_name : null,
                'cooldown_policy' => $request->status->value === 'released' ? $request->cooldown_policy : null,
                'lines' => $request->lines->map->only(['item_id', 'item_name_snapshot', 'quantity', 'base_unit'])->values()->all(),
            ];
        });

        return ['programs' => $options, 'records' => ['data' => $records->items(),
            'meta' => ['current_page' => $records->currentPage(), 'last_page' => $records->lastPage(), 'total' => $records->total(),
                'from' => $records->firstItem(), 'to' => $records->lastItem()],
            'links' => ['prev' => $records->previousPageUrl(), 'next' => $records->nextPageUrl()]], 'totals' => $totals];
    }

    private function query(string $municipalId, array $identity, string $role): Builder
    {
        return DistributionRequest::query()->where('municipal_id', $municipalId)->where(function ($q) use ($identity, $role) {
            if ($role === 'filer') {
                $q->whereIn('beneficiary_id', $identity['beneficiary_ids']);

                return;
            }
            $q->where(function ($recipient) use ($identity) {
                $recipient->where(function ($released) use ($identity) {
                    $released->where('status', 'released')->whereNotNull('handover_snapshot');
                    $this->recipient($released, $identity, 'handover_snapshot');
                })->orWhere(function ($reviewed) use ($identity) {
                    $reviewed->where(fn ($state) => $state->where('status', '!=', 'released')->orWhereNull('handover_snapshot'));
                    $this->recipient($reviewed, $identity, 'reviewed_snapshot');
                });
            });
            if ($role === 'all') {
                $q->orWhereIn('beneficiary_id', $identity['beneficiary_ids']);
            }
        });
    }

    private function recipient(Builder $query, array $identity, string $snapshot): void
    {
        $query->where(fn ($q) => $q
            ->where(fn ($self) => $self->whereNull('assisted_household_member_id')->whereIn('beneficiary_id', $identity['beneficiary_ids']))
            ->orWhere(fn ($other) => $other->whereNotNull('assisted_household_member_id')->where(fn ($person) => $person
                ->whereIn($snapshot.'->subject->beneficiary_id', $identity['beneficiary_ids'])
                ->orWhere(fn ($unlinked) => $unlinked->whereNull($snapshot.'->subject->beneficiary_id')->whereIn('assisted_household_member_id', $identity['member_ids'])))));
    }
}
