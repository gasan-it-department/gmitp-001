<?php

namespace App\Core\Municipality\Rules;

use App\Core\Municipality\Repositories\MunicipalityRepository;

use App\Core\Municipality\Exceptions\MunicipalityValidationException;

class MunicipalityValidator
{
    public function __construct(protected MunicipalityRepository $municipalityRepository)
    {
    }

    public function validate(object $dto)
    {
        $errors = [];

        if (empty($dto->name)) {
            $errors[] = 'Name is required';
        }

        if (empty($dto->code)) {
            $errors[] = 'Code is required';
        }

        $ignoreId = property_exists($dto, 'id') ? $dto->id : null;

        if ($this->municipalityRepository->findByName($dto->name, $ignoreId)) {
            $errors[] = 'Municipality is already exist.';
        }

        if ($this->municipalityRepository->findByZipCode($dto->zipCode, $ignoreId)) {
            $errors[] = 'Municipality zip code is already exist.';
        }

        if ($this->municipalityRepository->findByCode($dto->code, $ignoreId)) {
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
