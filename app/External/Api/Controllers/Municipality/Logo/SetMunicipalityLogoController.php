<?php

namespace App\External\Api\Controllers\Municipality\Logo;

use App\Core\Municipality\Dto\SetMunicipalityLogoDto;
use App\Core\Municipality\UseCases\SetMunicipalityLogoUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SetMunicipalityLogoController extends Controller
{

    public function __construct(
        private SetMunicipalityLogoUseCase $setMunicipalityLogoUseCase
    ) {
    }

    public function __invoke(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $userId = $request->user()->id;
        $municipalId = app('municipal_id');

        $municipalLogo = $request->file('logo');

        $dto = new SetMunicipalityLogoDto(
            municipalId: $municipalId,
            userId: $userId,
            municipalLogo: $municipalLogo
        );

        $this->setMunicipalityLogoUseCase->execute($dto);

        return back()->with('success', 'Logo uploaded successfully.');
    }

}