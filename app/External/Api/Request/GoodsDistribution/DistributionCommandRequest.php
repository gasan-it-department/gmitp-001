<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class DistributionCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        $permission = match ($this->route('command')) {
            'review' => 'process', 'resubmit' => 'intake', 'release' => 'release', 'approve', 'cancel' => 'decide',
            'return' => null,
        };

        return $permission ? $this->user()->can('goods_distribution.requests.'.$permission)
            : ($this->user()->can('goods_distribution.requests.process') || $this->user()->can('goods_distribution.requests.decide'));
    }

    public function rules(): array
    {
        $release = $this->route('command') === 'release';

        return [
            'version' => ['required', 'integer', 'min:1'], 'operation_key' => ['required', 'string', 'max:100'],
            'reason' => [in_array($this->route('command'), ['return', 'cancel']) ? 'required' : 'nullable', 'string', 'min:10', 'max:1000'],
            'recipient_reviewed' => [$this->route('command') === 'approve' ? 'required' : 'exclude', 'accepted'],
            'actual_release_on' => [$release ? 'required' : 'nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'collector_type' => [$release ? 'required' : 'nullable', 'in:recipient,representative'],
            'collector_name' => ['exclude_unless:collector_type,representative', 'required_if:collector_type,representative', 'nullable', 'string', 'max:255'],
            'collector_relationship' => ['exclude_unless:collector_type,representative', 'required_if:collector_type,representative', 'nullable', 'string', 'max:100'],
            'collector_id_type' => ['exclude_unless:collector_type,representative', 'required_if:collector_type,representative', 'nullable', 'string', 'max:100'],
            'collector_id_last_four' => ['exclude_unless:collector_type,representative', 'required_if:collector_type,representative', 'nullable', 'string', 'size:4'],
            'identity_inspected' => [$release ? 'required' : 'exclude', 'accepted'],
            'acknowledgement_confirmed' => [$release ? 'required' : 'exclude', 'accepted'],
            'acknowledgement_reference' => [$release ? 'required' : 'nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'confirmed_allocation_ids' => [$release ? 'required' : 'nullable', 'array', 'min:1'],
            'confirmed_allocation_ids.*' => ['ulid', 'distinct'],
        ];
    }
}
