<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\PositionRepository;
use App\Core\Government\Repositories\TermRepository;

class GetPublicRosterUseCase
{

    public function __construct(
        private TermRepository $termRepo,
        private PositionRepository $positionRepo,
    ) {
    }

    public function execute(string $municipalId, ?string $termSlug)
    {
        //this is for whowing the list of the Term that is published publicly
        $publishedTerms = $this->termRepo->getPublishedByMunicipality($municipalId);

        if ($publishedTerms->isEmpty()) {
            abort(404, 'No public records available.');
        }

        if ($termSlug) {
            $activeTerm = $this->termRepo->getPublishedBySlug($termSlug, $municipalId);
        } else {
            $activeTerm = $publishedTerms->firstWhere('is_current', true) ?? $publishedTerms->first();
        }

        if (!$activeTerm) {
            abort(404, 'Term not found or not yet published.');
        }

        $roster = $this->positionRepo->getPublicRosterForTerm($municipalId, $activeTerm->id);

        return [
            'publishedTerms' => $publishedTerms,
            'term' => $activeTerm,
            'roster' => $roster,
        ];
    }

}