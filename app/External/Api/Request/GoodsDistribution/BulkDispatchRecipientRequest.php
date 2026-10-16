<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\BulkRecipientAcknowledgement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class BulkDispatchRecipientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.bulk_dispatches.view');
    }

    public function rules(): array
    {
        $write = ! $this->isMethod('get');
        $command = $this->route('recipientCommand');

        return [
            'version' => [$write ? 'required' : 'nullable', 'integer', 'min:1'],
            'recipient_version' => [$write && $command !== 'create' ? 'required' : 'nullable', 'integer', 'min:1'],
            'submission_key' => [$command === 'create' ? 'required' : 'nullable', 'string', 'max:100'],
            'operation_key' => [$write && $command !== 'create' ? 'required' : 'nullable', 'string', 'max:100'],
            'reason' => [in_array($command, ['correct', 'void'], true) ? 'required' : 'nullable', 'string', 'min:10', 'max:2000'],
            'first_name' => [$command === 'create' ? 'required' : 'sometimes', 'filled', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => [$command === 'create' ? 'required' : 'sometimes', 'filled', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'full_name' => ['prohibited'],
            'barangay' => ['nullable', 'string', 'max:150'], 'purok' => ['nullable', 'string', 'max:255'],
            'received_on' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'collector_name' => ['nullable', 'string', 'max:255'], 'collector_relationship' => ['nullable', 'string', 'max:150'],
            'paper_reference' => ['nullable', 'string', 'max:150'], 'paper_row' => ['nullable', 'string', 'max:50'],
            'acknowledgement' => ['nullable', Rule::enum(BulkRecipientAcknowledgement::class)], 'remarks' => ['nullable', 'string', 'max:2000'],
            'lines' => ['sometimes', 'array', 'max:100'], 'lines.*.bulk_dispatch_line_id' => ['required', 'ulid', 'distinct'],
            'lines.*.quantity' => ['required', 'string', 'max:16'],
            'search' => ['nullable', 'string', 'max:1023'], 'quantity_details' => ['nullable', 'in:recorded,missing'],
            'recipient_status' => ['nullable', 'in:active,voided'], 'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', Rule::when($this->filled('from'), 'after_or_equal:from')], 'page' => ['nullable', 'integer', 'min:1'],
            'exclude_id' => ['nullable', 'ulid'],
            'beneficiary_id' => ['prohibited'], 'household_member_id' => ['prohibited'],
        ];
    }
}
