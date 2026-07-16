<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use App\External\Api\Request\Cemetery\Decedents\Concerns\HasDecedentRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDecedentRequest extends FormRequest
{
    use HasDecedentRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            ...$this->decedentRules($this->route('decedent_id')),
            'version' => ['required', 'integer', 'min:1'],
        ];
    }
}
