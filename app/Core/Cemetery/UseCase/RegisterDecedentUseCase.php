<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Repositories\DecedentsRepository;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\Traits\HasAddress;
use Illuminate\Support\Facades\DB;

class RegisterDecedentUseCase
{

    use HasAddress;
    public function __construct(
        private DecedentsRepository $decedentRepo,
        private IdGeneratorInterface $idGenerator,
    ) {
    }
    public function execute(DecedentDto $dto)
    {
        return DB::transaction(function () use ($dto) {

            $addressId = null;

            if ($dto->psgcBarangayId !== null) {
                $addressId = $this->createAddressSnapshot(
                    $dto->psgcBarangayId,
                    $dto->streetName,
                    $this->idGenerator
                );
            }

            $decedentId = $this->idGenerator->generate();

            return $this->decedentRepo->save($dto, $decedentId, $addressId);
        });

    }

}