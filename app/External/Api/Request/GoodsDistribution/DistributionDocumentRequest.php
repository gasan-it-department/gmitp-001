<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class DistributionDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.requests.process')
            || ($this->route('upload') && $this->user()->can('goods_distribution.requests.intake'));
    }

    public function rules(): array
    {
        return $this->route('upload') ? ['version' => ['required', 'integer', 'min:1'], 'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240']]
            : [
                'version' => ['required', 'integer', 'min:1'], 'status' => ['required', 'in:pending,verified,rejected'],
                'presented_copy_type' => ['nullable', Rule::in(PhysicalCopyRequirement::presentedValues())],
                'remarks' => ['required_if:status,rejected', 'nullable', 'string', 'max:2000'],
            ];
    }
}
