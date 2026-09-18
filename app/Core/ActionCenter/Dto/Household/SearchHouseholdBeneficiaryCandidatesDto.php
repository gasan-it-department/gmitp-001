<?php

namespace App\Core\ActionCenter\Dto\Household;

final readonly class SearchHouseholdBeneficiaryCandidatesDto
{
    public function __construct(
        public string $municipalId,
        public string $householdId,
        public string $search,
    ) {}

    /** @param array{q:string} $data */
    public static function fromArray(array $data, string $municipalId, string $householdId): self
    {
        return new self(
            municipalId: $municipalId,
            householdId: $householdId,
            search: trim($data['q']),
        );
    }
}
