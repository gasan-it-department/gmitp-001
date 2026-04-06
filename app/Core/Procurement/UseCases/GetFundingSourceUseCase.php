<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Models\ProcurementFundingSource;

class GetFundingSourceUseCase
{

    public function execute()
    {

        return ProcurementFundingSource::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);


    }

}