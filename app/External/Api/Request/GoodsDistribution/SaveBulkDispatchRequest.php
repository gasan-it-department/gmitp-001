<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveBulkDispatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.bulk_dispatches.prepare');
    }

    public function rules(): array
    {
        return ['submission_key' => [$this->route('dispatchId') ? 'nullable' : 'required', 'string', 'max:100'],
            'version' => [$this->route('dispatchId') ? 'required' : 'nullable', 'integer', 'min:1'],
            'operation_key' => [$this->route('dispatchId') ? 'required' : 'nullable', 'string', 'max:100'],
            'program_id' => ['required', 'ulid'], 'storage_location_id' => ['required', 'ulid'],
            'custodian_type' => ['required', Rule::enum(BulkCustodianType::class)], 'custodian_user_id' => ['nullable', 'ulid'],
            'custodian_name' => ['nullable', 'string', 'max:255'], 'custodian_role' => ['nullable', 'string', 'max:255'],
            'requester_name' => ['nullable', 'string', 'max:255'], 'requester_role' => ['nullable', 'string', 'max:255'],
            'destination_barangays' => ['present', 'array', 'max:100'], 'destination_barangays.*' => ['required', 'string', 'max:150', 'distinct'],
            'purpose' => ['nullable', Rule::enum(BulkDispatchPurpose::class)], 'purpose_notes' => ['nullable', 'string', 'max:2000'],
            'location_notes' => ['nullable', 'string', 'max:2000'], 'paper_reference' => ['nullable', 'string', 'max:150'],
            'lines' => ['present', 'array', 'max:100'], 'lines.*' => ['array:item_id,quantity'],
            'lines.*.item_id' => ['required', 'ulid', 'distinct'], 'lines.*.quantity' => ['nullable', 'string', 'regex:/^\d{1,12}(?:\.\d{1,3})?$/D']];
    }
}
