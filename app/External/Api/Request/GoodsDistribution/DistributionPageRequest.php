<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\DistributionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class DistributionPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.view');
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'], 'program_id' => ['nullable', 'ulid'],
            'beneficiary_id' => ['nullable', 'ulid'], 'household_id' => ['nullable', 'ulid'], 'status' => ['nullable', Rule::enum(DistributionStatus::class)],
            'from' => ['nullable', 'date_format:Y-m-d'], 'to' => array_filter(['nullable', 'date_format:Y-m-d', $this->filled('from') ? 'after_or_equal:from' : null]),
            'page' => ['nullable', 'integer', 'min:1'], 'history_page' => ['nullable', 'integer', 'min:1'],
            'tab' => ['nullable', 'in:goods,household,documents,history'],
            'recipient_profile_kind' => ['nullable', 'in:beneficiary,member'], 'recipient_profile_id' => ['nullable', 'ulid'],
            'profile_tab' => ['nullable', 'in:overview,received,requests'], 'profile_program_id' => ['nullable', 'ulid'],
            'profile_from' => ['nullable', 'date_format:Y-m-d'], 'profile_to' => ['nullable', 'date_format:Y-m-d'],
            'profile_status' => ['nullable', Rule::enum(DistributionStatus::class)], 'profile_role' => ['nullable', 'in:all,recipient,filer'],
            'profile_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
