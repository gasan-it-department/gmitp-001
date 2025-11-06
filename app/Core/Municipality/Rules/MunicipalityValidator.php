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

        if ($this->municipalityRepository->findByName($dto->name)) {
            $errors[] = 'Municipality is already exist.';
        }

        if ($this->municipalityRepository->findByName($dto->zipCode)) {
            $errors[] = 'Municipality zip code is already exist.';
        }

        if ($this->municipalityRepository->findByCode($dto->code)) {
            $errors[] = 'Municipal code is already exist.';
        }
        if (!is_bool($dto->isActive)) {
            $errors[] = 'isActive must be a boolean';
        }

        if (!empty($errors)) {
            throw new MunicipalityValidationException($errors);
        }
    }
}
