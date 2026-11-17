<?php

namespace App\Core\ActionCenter\Dto\Household;

readonly class HouseholdMemberDuplicateReviewDto
{
    public function __construct(
        public ?string $context = null,
        public ?string $reason = null,
        public bool $differentPerson = false,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self($data['duplicate_review_context'] ?? null, $data['different_person_reason'] ?? null,
            (bool) ($data['confirm_different_person'] ?? false));
    }
}
