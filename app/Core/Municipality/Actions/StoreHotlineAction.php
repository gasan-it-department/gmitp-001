<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Dto\StoreHotlineDto;
use App\Core\Municipality\Models\MunicipalityHotline;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class StoreHotlineAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(StoreHotlineDto $dto): MunicipalityHotline
    {
        return DB::transaction(function () use ($dto) {
            return MunicipalityHotline::create([
                'id'           => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'name'         => $dto->name,
                'number'       => $dto->number,
                'category'     => $dto->category,
                'is_active'    => $dto->isActive,
                'sort_order'   => $dto->sortOrder,
            ]);
        }, attempts: 3);
    }
}
