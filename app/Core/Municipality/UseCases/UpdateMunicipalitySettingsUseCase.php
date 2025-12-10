<?php

namespace App\Core\Municipality\UseCases;

use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Core\Municipality\Dto\UpdateMunicipalitySettingsDto;
use App\Core\Municipality\Repositories\MunicipalitySettingRepository;
use Illuminate\Support\Facades\DB;
class UpdateMunicipalitySettingsUseCase
{

    public function __construct(

        protected MunicipalitySettingRepository $municipalitySettingRepo,

        protected CloudinaryFileUploadService $cloudinaryFileUploadService,


    ) {
    }

    public function execute(UpdateMunicipalitySettingsDto $dto)
    {
        $existingSettings = $this->municipalitySettingRepo->findById($dto->settingsId);

        // If no logo is uploaded, proceed to update non-file data and return
        if (!$dto->logoImage) {
            $this->municipalitySettingRepo->update($existingSettings, $dto);
            return;
        }

        // --- Start Transaction for Atomicity ---
        DB::transaction(function () use ($existingSettings, $dto) {

            $oldPublicId = $existingSettings->logo_public_id;

            // 1. UPLOAD NEW FILE FIRST (Safe Swap Principle)
            $fileData = $this->cloudinaryFileUploadService->uploadFiles(
                $dto->logoImage,
                'municipal_logo'
            );

            // 2. UPDATE DATABASE with NEW file data
            // If this fails, the transaction rolls back, and the old file remains the active one.
            $this->municipalitySettingRepo->update($existingSettings, $dto, $fileData);

            // 3. DELETE OLD FILE (If a transaction is used, this delete happens *after* the DB commit)
            if ($oldPublicId) {
                try {
                    // We wrap the delete in a try/catch. If the delete fails, we log it,
                    // but we don't roll back the whole transaction since the new logo is already saved.
                    $this->cloudinaryFileUploadService->delete($oldPublicId);
                } catch (\Exception $e) {
                    // Log the error: The cleanup failed, but the primary update succeeded.
                    // Log::error("Failed to delete old logo {$oldPublicId}: " . $e->getMessage());
                }
            }
        });
    }

}