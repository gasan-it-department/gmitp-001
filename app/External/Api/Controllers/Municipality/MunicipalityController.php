<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Exceptions\MunicipalityValidationException;
use App\External\Api\Resources\Municipality\MunicipalityResource;
use App\Core\Users\Services\UserRoleCheckerService;
use App\External\Api\Request\Municipality\MunicipalityRequest;
use App\Core\Municipality\Services\AddMunicipalityService;
use App\Core\Municipality\Services\GetActiveMunicipality;
use App\Core\Municipality\Services\GetAllMunicipalities;
use App\Core\Municipality\Dto\UpdateMunicipalityDto;
use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Services\UpdateMunicipality;
class MunicipalityController
{
    public function __construct(
        private AddMunicipalityService $addMunicipalityService,
        private GetAllMunicipalities $getAllMunicipalities,
        private GetActiveMunicipality $getActiveMunicipality,
        private UserRoleCheckerService $roleCheckerService,
        private UpdateMunicipality $updateMunicipality,
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

            $municipality = $this->addMunicipalityService->execute($dto);

            return response()->json([
                'success' => true,
                'message' => 'municipality added successfully',
                'data' => $municipality
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

    //for super admin view
    public function index()
    {
        try {

            $municipalities = $this->getAllMunicipalities->execute();

            return response()->json([
                'success' => true,
                'data' => MunicipalityResource::collection($municipalities),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'failed to fetch municipalities',
            ], 500);
        }
    }

    //fetch active municipalities for non-super admin users
    public function indexActiveMunicipalities()
    {
        try {
            $municipalities = $this->getActiveMunicipality->execute();
            return response()->json([
                'success' => true,
                'data' => MunicipalityResource::collection($municipalities),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'failed to fetch active municipalities',
            ], 200);
        }
    }

    public function update(MunicipalityRequest $request, $id)
    {
        try {

            $validatedData = $request->validated();

            $dto = new UpdateMunicipalityDto(
                $id,
                $validatedData['name'],
                $validatedData['municipal_code'],
                $validatedData['zip_code'],
                $validatedData['is_active'],
            );

            $municipality = $this->updateMunicipality->execute($dto);

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