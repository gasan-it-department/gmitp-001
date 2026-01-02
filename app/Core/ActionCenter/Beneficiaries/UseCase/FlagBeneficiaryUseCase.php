<?php

namespace App\Core\ActionCenter\Beneficiaries\UseCase;

use App\Core\ActionCenter\Beneficiaries\Dto\FlagBeneficiaryDto;
use App\Core\ActionCenter\Beneficiaries\Repositories\BeneficiaryRepositories;
use App\Core\ActionCenter\Beneficiaries\Repositories\FlagRepositories;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class FlagBeneficiaryUseCase
{

    public function __construct(

        protected FlagRepositories $flagRepo,

        protected IdGeneratorInterface $idGeneratorInterface,

    ) {
    }

    public function execute(FlagBeneficiaryDto $dto)
    {

        $flagId = $this->idGeneratorInterface->generate();

        $flag = $this->flagRepo->create($dto, $flagId);

        return $flag;

    }

}