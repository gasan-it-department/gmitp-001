<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\CooldownScope;
use App\Core\GoodsDistribution\Enums\CooldownUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveProgramCooldownRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        return ['cooldown_enabled' => ['required', 'boolean'], 'cooldown_scope' => ['required', Rule::enum(CooldownScope::class)],
            'cooldown_duration' => ['required_if:cooldown_enabled,true', 'nullable', 'integer', 'min:1', 'max:3650'],
            'cooldown_unit' => ['required_if:cooldown_enabled,true', 'nullable', Rule::enum(CooldownUnit::class)]];
    }
}
