<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Actions\UpdateMunicipalityAction;
use App\Core\Municipality\Dto\UpdateMunicipalityDto;
use App\Core\Municipality\Exceptions\MunicipalityValidationException;
use App\External\Api\Request\Municipality\MunicipalityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UpdateMunicipalityController extends Controller
{
    public function __construct(
        private UpdateMunicipalityAction $updateMunicipalityAction,
    ) {
    }

    public function __invoke(MunicipalityRequest $request, string $id)
    {
        $municipalityData = $request->validated();

        $psgcMunicipal = DB::table('psgc_municipalities')
            ->where('id', $municipalityData['psgc_municipal_id'])
            ->first();

        $dto = new UpdateMunicipalityDto(
            id: $id,
            name: strtoupper($psgcMunicipal->name),
            code: $psgcMunicipal->psgc_code,
            zipCode: $municipalityData['zip_code'],
            isActive: $municipalityData['is_active'] ?? false,
        );

        try {
            $this->updateMunicipalityAction->execute($dto);
        } catch (MunicipalityValidationException $e) {
            return redirect()->back()->withErrors([
                'municipality' => implode(' ', $e->getErrors()),
            ])->withInput();
        }

        return redirect()->back()->with('success', 'Municipality updated successfully.');
    }
}
