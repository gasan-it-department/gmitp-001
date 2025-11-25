<?php

namespace App\Core\ActionCenter\Beneficiaries\UseCase;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\ActionCenter\Beneficiaries\Dto\CreateBeneficiaryDto;
use App\Core\ActionCenter\Beneficiaries\Repositories\BeneficiaryRepositories;



class CreateBeneficiaryUseCase
{

    public function __construct(

        protected BeneficiaryRepositories $beneficiaryRepo,

        protected IdGeneratorInterface $idGenerator,

    ) {
    }

    public function execute(CreateBeneficiaryDto $dto)
    {

        $beneficiaryId = $this->idGenerator->generate();

        $beneficiary = $this->beneficiaryRepo->save($dto, $beneficiaryId);

        return $beneficiary;

    }

}