<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Core\ActionCenter\Enums\HouseholdReassignmentOperation;

final readonly class ReassignBeneficiaryHouseholdDto
{
    public function __construct(
        public string $beneficiaryId,
        public string $municipalId,
        public string $actingAdminId,
        public HouseholdReassignmentOperation $operation,
        public string $reason,
        public ?string $destinationHouseholdId,
        public ?string $destinationMemberId,
        public ?string $newHouseholdBarangay,
        public ?string $newHouseholdStreet,
        public bool $verifyAtDestination,
        public ?string $successorMemberId,
        public bool $placeHouseholdOnHold,
    ) {}

    public static function fromArray(
        array $data,
        string $beneficiaryId,
        string $municipalId,
        string $actingAdminId,
    ): self {
        return new self(
            beneficiaryId: $beneficiaryId,
            municipalId: $municipalId,
            actingAdminId: $actingAdminId,
            operation: HouseholdReassignmentOperation::from($data['operation']),
            reason: $data['reason'],
            destinationHouseholdId: $data['destination_household_id'] ?? null,
            destinationMemberId: $data['destination_member_id'] ?? null,
            newHouseholdBarangay: ! empty($data['new_household_barangay'])
                ? mb_strtoupper($data['new_household_barangay'])
                : null,
            newHouseholdStreet: ! empty($data['new_household_street'])
                ? mb_strtoupper($data['new_household_street'])
                : null,
            verifyAtDestination: (bool) ($data['verify_at_destination'] ?? false),
            successorMemberId: $data['successor_member_id'] ?? null,
            placeHouseholdOnHold: (bool) ($data['place_household_on_hold'] ?? false),
        );
    }
}
