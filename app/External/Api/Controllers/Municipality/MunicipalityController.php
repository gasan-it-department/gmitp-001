<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Exceptions\MunicipalityValidationException;
use App\External\Api\Request\Municipality\MunicipalityRequest;
use App\Core\Municipality\Services\AddMunicipalityService;
use App\Core\Municipality\Services\GetAllMunicipalities;
use App\Core\Municipality\Dto\AddMunicipalityDto;
use Request;

class MunicipalityController
{
    public function __construct(
        private AddMunicipalityService $addMunicipalityService,
        private GetAllMunicipalities $getAllMunicipalities,
    ) {
    }

    public function store(MunicipalityRequest $request)
    {
        try {
            $municipalityData = $request->validated();

            $dto = new AddMunicipalityDto(
                name: $municipalityData['name'],
                code: $municipalityData['municipal_code'],
                zipCode: $municipalityData['zip_code'],
                isActive: $municipalityData['is_active'] ?? false,
            );

            $this->addMunicipalityService->execute($dto);

            return response()->json([
                'success' => true,
                'message' => 'municipality added successfully',
            ], 201);
        } catch (MunicipalityValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'failed to add municipality',
                'errors' => $e->getErrors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'failed to add municipality',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    public function index()
    {
        try {
            $municipalities = $this->getAllMunicipalities->execute();

            return response()->json([
                'success' => true,
                'data' => $municipalities,
            ], 200);
        } catch (\Exception $e) {
        }
    }

    public function update()
    {

    }

    public function changeStatus($id)
    {

    }
}