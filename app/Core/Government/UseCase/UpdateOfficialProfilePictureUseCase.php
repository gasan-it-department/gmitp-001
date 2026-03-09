<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialRepository;
use App\Shared\FileUploader\Interface\FileUploadInterface;
use Illuminate\Http\UploadedFile;

class UpdateOfficialProfilePictureUseCase
{

    public function __construct(
        private FileUploadInterface $fileUpload,
        private OfficialRepository $officialRepo,
    ) {
    }

    public function execute(string $municipalId, string $officialId, UploadedFile $image)
    {

        if ($image) {

            $folder = $this->fileUpload->getFolderPath($municipalId, 'government', $officialId);

            $result = $this->fileUpload->uploadFiles($image, $folder, 'profile', true);

            $this->officialRepo->update([
                'profile_url' => $result['secure_url'],
                'profile_public_id' => $result['public_id'],
            ], $municipalId, $officialId);
        }
    }

}