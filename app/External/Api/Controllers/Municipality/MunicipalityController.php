<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Exceptions\MunicipalityValidationException;
use App\External\Api\Request\Municipality\MunicipalityRequest;
use App\Core\Municipality\Services\AddMunicipalityService;
use App\Core\Municipality\Services\GetAllMunicipalities;
use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Models\Municipality;

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

    public function update(MunicipalityRequest $request, $id)
    {
        try {
            $validatedData = $request->validated();
            $municipality = Municipality::findOrFail($id);
            $municipality->update([
                'name' => $validatedData['name'],
                'code' => $validatedData['municipal_code'],
                'zip_code' => $validatedData['zip_code'],
                'is_active' => $validatedData['is_active'] ?? false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Municipality updated successfully!',
                'data' => $municipality,
            ], 200);
        } catch (MunicipalityValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed during update.',
                'errors' => $e->getErrors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Municipality not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update municipality.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}