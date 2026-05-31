<?php

namespace App\External\Api\Request\Municipality;

use App\Core\Municipality\Enums\HotlineCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHotlineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['sometimes', 'required', 'string', 'max:255'],
            'number'     => ['sometimes', 'required', 'string', 'max:50'],
            'category'   => ['sometimes', 'required', 'string', Rule::enum(HotlineCategory::class)],
            'is_active'  => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
