<?php

namespace App\External\Api\Request\Tourism;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourismCategoryRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'max:500'],
            'type' => ['required', 'max:100']
        ];
    }

}