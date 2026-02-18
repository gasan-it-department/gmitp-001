<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\AddOfficialDto;
use App\Core\Government\Repositories\OfficialRepository;
use App\Shared\FileUploader\Interface\FileUploadInterface;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class AddOfficialUseCase
{

    public function __construct(

        protected OfficialRepository $officialRepo,
        protected IdGeneratorInterface $idGenerator,
        protected FileUploadInterface $fileUpload,

    ) {
    }

    public function execute(AddOfficialDto $dto)
    {

        $officialId = $this->idGenerator->generate();

        $profileUrl = null;
        $publicId = null;

        if ($dto->profileImage) {

            $root = config('filesystems.disks.cloudinary.root');

            $folder = "{$root}/{$dto->municipalName}/government/officials/{$officialId}";

            $result = $this->fileUpload->uploadFiles($dto->profileImage, $folder, 'profile', true);

            $profileUrl = $result['secure_url'];
            $publicId = $result['public_id'];
        }

        return $this->officialRepo->addOfficial($dto, $officialId, $publicId, $profileUrl);

    }

}