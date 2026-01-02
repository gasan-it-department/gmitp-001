<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Core\ActionCenter\Beneficiaries\Dto\FlagBeneficiaryDto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\ActionCenter\Beneficiaries\UseCase\FlagBeneficiaryUseCase;
use Illuminate\Support\Facades\Redirect;

class BeneficiaryFlagController extends Controller
{

    public function __construct(
        protected FlagBeneficiaryUseCase $flagBeneficiaryUseCase,
    ) {
    }

    public function store(Request $request, $id)
    {

        $request->validate([

            'reason' => 'required|string|max:255',
            'severity' => 'required|in:warning,blacklist',
            'notes' => 'nullable|string',

        ]);

        try {

            $dto = FlagBeneficiaryDto::fromRequest($request, $id);

            $this->flagBeneficiaryUseCase->execute($dto);

            return Redirect::back()->with('flash', [
                'type' => 'success',
                'title' => 'Beneficiary Flagged',
                'message' => 'The record has been updated with a new security flag.'
            ]);

        } catch (\Exception $e) {

            return Redirect::back()->with('flash', [
                'type' => 'error',
                'title' => 'Action Failed',
                'message' => 'Could not flag the beneficiary: ' . $e->getMessage()
            ]);

        }

    }

}