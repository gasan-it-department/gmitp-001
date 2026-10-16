<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class BulkAdditionalIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.bulk_dispatches.view');
    }

    public function rules(): array
    {
        $command = $this->route('additionalCommand');

        return [
            'version' => ['required', 'integer', 'min:1'],
            'operation_key' => [$command === 'preview' ? 'nullable' : 'required', 'string', 'max:100'],
            'reason' => [in_array($command, ['create', 'cancel'], true) ? 'required' : 'nullable', 'string', 'min:10', 'max:2000'],
            'fingerprint' => [$command === 'approve' ? 'required' : 'nullable', 'string', 'size:64'],
            'lines' => [$command === 'create' ? 'required' : 'prohibited', 'array', 'min:1', 'max:100'],
            'lines.*' => ['array:item_id,quantity'], 'lines.*.item_id' => ['required', 'ulid', 'distinct'],
            'lines.*.quantity' => ['required', 'string', 'regex:/^\d{1,12}(?:\.\d{1,3})?$/D'],
            'actual_on' => [$command === 'issue' ? 'required' : 'nullable', 'date_format:Y-m-d'],
            'custodian_acknowledged' => [$command === 'issue' ? 'required' : 'nullable', 'boolean'],
            'confirmed_allocation_ids' => [$command === 'issue' ? 'required' : 'nullable', 'array', 'min:1', 'max:1000'],
            'confirmed_allocation_ids.*' => ['required', 'ulid', 'distinct'],
        ];
    }
}
