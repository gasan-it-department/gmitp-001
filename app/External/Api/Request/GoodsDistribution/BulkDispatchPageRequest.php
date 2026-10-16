<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use App\Core\GoodsDistribution\Enums\BulkDispatchStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class BulkDispatchPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.bulk_dispatches.view');
    }

    public function rules(): array
    {
        return ['tab' => ['nullable', 'in:goods,recipients,reconciliation,attachments,history'], 'search' => ['nullable', 'string', 'max:150'],
            'quantity_details' => ['nullable', 'in:recorded,missing'], 'recipient_status' => ['nullable', 'in:active,voided'],
            'program_id' => ['nullable', 'ulid'], 'status' => ['nullable', Rule::enum(BulkDispatchStatus::class)],
            'custodian_type' => ['nullable', Rule::enum(BulkCustodianType::class)], 'barangay' => ['nullable', 'string', 'max:150'],
            'purpose' => ['nullable', Rule::enum(BulkDispatchPurpose::class)],
            'from' => ['nullable', 'date_format:Y-m-d'], 'to' => ['nullable', 'date_format:Y-m-d', Rule::when($this->filled('from'), 'after_or_equal:from')],
            'page' => ['nullable', 'integer', 'min:1']];
    }
}
