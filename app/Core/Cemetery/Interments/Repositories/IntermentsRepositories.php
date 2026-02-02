<?php

namespace App\Core\Cemetery\Interments\Repositories;

use App\Core\Cemetery\Interments\Dto\AddIntermentsDto;
use App\Core\Cemetery\Interments\Models\Interment;

class IntermentsRepositories
{

    public function save(AddIntermentsDto $dto, string $intermentId)
    {

        return Interment::updateOrCreate(['id' => $intermentId], $dto->toArray());

    }

    public function findById(string $id): ?Interment
    {

        return Interment::find($id);

    }

}