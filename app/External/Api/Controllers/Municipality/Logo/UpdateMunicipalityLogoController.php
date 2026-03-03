<?php

namespace App\External\Api\Controllers\Municipality\Logo;

use App\Core\Municipality\Dto\SetMunicipalityLogoDto;
use App\Core\Municipality\UseCases\UpdateMunicipalityLogoUseCase;
use Illuminate\Http\Request;

class UpdateMunicipalityLogoController
{

    public function __construct(
        private UpdateMunicipalityLogoUseCase $updateMunicipalityLogoUseCase
    ) {
    }

    public function __invoke(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $dto = new SetMunicipalityLogoDto(
            municipalId: app('municipal_id'), // Correct: Single source of truth
            userId: $request->user()->id,
            municipalLogo: $request->file('logo')
        );

        $this->updateMunicipalityLogoUseCase->execute($dto);

        return back()->with('success', 'Logo uploaded successfully.');
    }
}




