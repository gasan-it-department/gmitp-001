<?php

namespace App\Core\Municipality\Rules;

use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Repositories\MunicipalityRepository;

use App\Core\Municipality\Exceptions\MunicipalityValidationException;

class MunicipalityValidator
{
    public function __construct(protected MunicipalityRepository $municipalityRepository)
    {
    }

    public function validate(AddMunicipalityDto $dto)
    {
        $errors = [];

        if (empty($dto->name)) {
            $errors[] = 'Name is required';
        }

        if (empty($dto->code)) {
            $errors[] = 'Code is required';
        }

        if ($this->municipalityRepository->findByCode($dto->code)) {
            $errors[] = 'Code must be unique';
        }
        if (!is_bool($dto->isActive)) {
            $errors[] = 'isActive must be a boolean';
        }
        if ($this->municipalityRepository->findByName($dto->name)) {
            $errors[] = 'Name must be unique';
        }

        if (!empty($errors)) {
            throw new MunicipalityValidationException($errors);
        }
    }
}
