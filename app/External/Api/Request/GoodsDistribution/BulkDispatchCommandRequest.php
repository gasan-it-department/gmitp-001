<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class BulkDispatchCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.bulk_dispatches.view');
    }

    public function rules(): array
    {
        $command = $this->route('command');
        $preview = in_array($command, ['approval-preview', 'reconciliation-preview'], true);
        $reconcile = in_array($command, ['reconciliation-preview', 'report', 'return'], true);
        $reason = in_array($command, ['withdraw', 'cancel', 'reopen', 'reverse'], true);

        return ['version' => ['required', 'integer', 'min:1'],
            'operation_key' => [$preview ? 'nullable' : 'required', 'string', 'max:100'],
            'fingerprint' => [in_array($command, ['approve', 'report', 'return'], true) ? 'required' : 'nullable', 'string', 'size:64'],
            'reason' => [$reason ? 'required' : 'nullable', 'string', 'min:10', 'max:2000'],
            'actual_on' => [$reconcile || $command === 'dispatch' ? 'required' : 'nullable', 'date_format:Y-m-d'],
            'custodian_acknowledged' => [$command === 'dispatch' ? 'required' : 'nullable', 'boolean'],
            'confirmed_allocation_ids' => [$command === 'dispatch' ? 'required' : 'nullable', 'array', 'max:1000'],
            'confirmed_allocation_ids.*' => ['required', 'ulid', 'distinct'],
            'kind' => [$command === 'reconciliation-preview' ? 'required' : 'nullable', 'in:distribution,return'],
            'reference' => ['nullable', 'string', 'max:150'], 'notes' => ['nullable', 'string', 'max:2000'],
            'usable_confirmed' => [$command === 'return' ? 'required' : 'nullable', 'boolean'],
            'reconciliation_id' => [$command === 'reverse' ? 'required' : 'nullable', 'ulid'],
            'lines' => [$reconcile ? 'required' : 'nullable', 'array', 'min:1', 'max:100'],
            'lines.*' => ['array:item_id,allocation_id,quantity'],
            'lines.*.item_id' => ['nullable', 'ulid'], 'lines.*.allocation_id' => ['nullable', 'ulid'],
            'lines.*.quantity' => ['required', 'string', 'regex:/^\d{1,12}(?:\.\d{1,3})?$/D']];
    }
}
