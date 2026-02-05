<?php

namespace App\Core\Government\UseCase;

use Illuminate\Auth\Access\AuthorizationException;
use App\Core\Government\Repositories\TermRepository;

class GetTermDetailsUseCase
{

    public function __construct(

        protected TermRepository $termRepository,


    ) {
    }

    public function execute(string $termId, string $currentMunicipalId)
    {

        $term = $this->termRepository->findById($termId);

        if (!$term) {

            throw new \Exception("Term not found.");

        }

        if ($term->municipal_id !== $currentMunicipalId) {
            throw new AuthorizationException(
                "Access Denied: You cannot manage terms for another municipality."
            );
        }

        return $term;

    }

}