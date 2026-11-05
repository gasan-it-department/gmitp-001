<?php

namespace App\External\Api\Request\Facility;

use App\Core\Facility\Enums\FacilityType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['search' => ['nullable', 'string', 'max:255'], 'type' => ['nullable', Rule::enum(FacilityType::class)],
            'publication' => ['nullable', Rule::in(['draft', 'published'])], 'page' => ['nullable', 'integer', 'min:1']];
    }
}
