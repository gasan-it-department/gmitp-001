<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\External\Api\Request\ActionCenter\Walkin\StoreWalkInBeneficiaryRequest;

final class StoreGoodsHouseholdHeadRequest extends StoreWalkInBeneficiaryRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'actual_household_head' => ['required', 'accepted']];
    }
}
