<?php

namespace App\External\Api\Request\Municipality;

use App\Core\Municipality\Enums\HotlineCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHotlineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'number'     => ['required', 'string', 'max:50'],
            'category'   => ['required', 'string', Rule::enum(HotlineCategory::class)],
            'is_active'  => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Please provide a hotline name.',
            'number.required'   => 'Please provide a hotline number.',
            'category.required' => 'Please choose a hotline category.',
        ];
    }
}
