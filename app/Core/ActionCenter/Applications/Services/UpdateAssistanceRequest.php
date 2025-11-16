<?php

namespace App\Core\ActionCenter\Applications\Services;

use App\Core\ActionCenter\Domains\Enums\RequestStatus;
use App\Core\ActionCenter\Applications\Dto\AssistanceRequestDto;
use App\Core\ActionCenter\Applications\Dto\BeneficiaryDto;
use App\Core\Users\Services\UserRoleCheckerService;
use App\Core\ActionCenter\Infrastructures\Repositories\AssistanceRequestRepositories;
use Illuminate\Support\Facades\DB;

class UpdateAssistanceRequest
{
    public function __construct(
        protected UserRoleCheckerService $roleCheckerService,
        protected AssistanceRequestRepositories $assistanceRepository
    ) {
    }

    /**
     * Update an existing assistance request and its beneficiary.
     *
     * @param string $id  AssistanceRequest ID
     * @param array $data  Validated input data
     * @param mixed $user  Authenticated user
     */
    public function execute(string $id, array $data, $user): void
    {
        DB::beginTransaction();

        try {
            // Check if user is admin
            $isAdmin = $this->roleCheckerService->isAdmin($user);

            // Fetch existing request
            $existing = $this->assistanceRepository->findOrFail($id);

            // Determine new status
            $status = $data['status'] ?? (
                $isAdmin
                ? RequestStatus::APPROVED->value
                : $existing->status
            );

            // Prepare updated request DTO
            $updatedRequest = new AssistanceRequestDto(
                $existing->id,
                $existing->transaction_number,
                $data['assistance_type'] ?? $existing->assistance_type,
                $data['description'] ?? $existing->description,
                $status,
                $existing->user_id
            );

            // Prepare updated beneficiary DTO if provided
            $updatedBeneficiary = null;
            if (isset($data['first_name'])) {
                $b = $existing->beneficiary;
                $updatedBeneficiary = new BeneficiaryDto(
                    $b->id,
                    $data['first_name'] ?? $b->first_name,
                    $data['last_name'] ?? $b->last_name,
                    $data['middle_name'] ?? $b->middle_name,
                    $data['suffix'] ?? $b->suffix,
                    $data['birth_date'] ?? $b->birth_date,
                    $data['contact_number'] ?? $b->contact_number,
                    $data['province'] ?? $b->province,
                    $data['municipality'] ?? $b->municipality,
                    $data['barangay'] ?? $b->barangay
                );
            }

            // Call repository to persist changes
            $this->assistanceRepository->update($updatedRequest, $updatedBeneficiary);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
