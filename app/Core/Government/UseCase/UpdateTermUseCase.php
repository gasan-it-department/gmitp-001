<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\TermDto;
use App\Core\Government\Repositories\TermRepository;

class UpdateTermUseCase
{

    public function __construct(

        protected TermRepository $termRepo,

    ) {
    }

    public function execute(string $termId, TermDto $dto)
    {
        $existingTerm = $this->termRepo->findById($termId);

        if (!$existingTerm) {

            dd('term not found');

        }

        if ($existingTerm->municipal_id !== $dto->municipalId) {

            dd('You are not authorize to edit this term');

        }

        if ($dto->isCurrent === true) {
            $this->termRepo->markAllAsInactive($dto->municipalId);
        }

        return $this->termRepo->update($termId, $dto);

    }

}