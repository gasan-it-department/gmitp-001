<?php

namespace App\External\Api\Request\Cemetery\Plots;

use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdatePlotDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->input('name')) ? mb_strtoupper(trim($this->input('name'))) : $this->input('name'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', new Enum(PlotTypes::class), Rule::notIn([PlotTypes::APARTMENT_NICHE->value])],
        ];
    }

    public function messages(): array
    {
        return [
            'type.not_in' => 'Apartment niches cannot be manually changed through plot details editing.',
        ];
    }
}
