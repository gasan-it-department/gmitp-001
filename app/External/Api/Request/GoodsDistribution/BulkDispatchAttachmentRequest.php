<?php

namespace App\External\Api\Request\GoodsDistribution;

use Illuminate\Foundation\Http\FormRequest;

final class BulkDispatchAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.bulk_dispatches.view');
    }

    public function rules(): array
    {
        return ['version' => ['required', 'integer', 'min:1'], 'operation_key' => ['required', 'string', 'max:100'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240']];
    }
}
