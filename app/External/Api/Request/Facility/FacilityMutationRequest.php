<?php

namespace App\External\Api\Request\Facility;

use Illuminate\Foundation\Http\FormRequest;

class FacilityMutationRequest extends FormRequest
{
    protected string $ability = 'facility.manage';

    public function authorize(): bool
    {
        return $this->user()?->can($this->ability) === true;
    }

    public function rules(): array
    {
        return ['revision' => ['required', 'integer', 'min:0'], 'municipal_id' => ['prohibited']];
    }
}
