<?php

namespace App\Core\Tourism\UseCase\Category;

use App\Core\Tourism\Dto\StoreCategoryDto;
use App\Core\Tourism\Models\Category;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class StoreCategoryAction
{
    public function __construct(
        protected IdGeneratorInterface $idGeneratorInterface,
    ) {
    }

    public function execute(StoreCategoryDto $dto)
    {
        return Category::create([
            'id' => $this->idGeneratorInterface->generate(),
            'name' => $dto->name,
            'description' => $dto->description,
            'type' => $dto->type,
            'municipal_id' => $dto->municipalId,
        ]);

    }
}