<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use App\External\Api\Request\Cemetery\Decedents\Concerns\HasDecedentRules;
use Illuminate\Foundation\Http\FormRequest;

class CreateDecedentRequest extends FormRequest
{
    use HasDecedentRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->decedentRules();
    }
}
