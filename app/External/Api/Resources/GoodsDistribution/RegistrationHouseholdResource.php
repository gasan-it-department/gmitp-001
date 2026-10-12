<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class RegistrationHouseholdResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_code' => $this->household_code,
            'barangay' => $this->barangay,
            'street' => $this->street,
            'head_name' => $this->activeHead ? trim(implode(' ', array_filter([
                $this->activeHead->first_name, $this->activeHead->middle_name, $this->activeHead->last_name, $this->activeHead->suffix,
            ]))) : null,
        ];
    }
}
