<?php

namespace App\Core\ActionCenter\Applications\Services;

use App\Core\ActionCenter\Domains\Enums\RequestStatus;
use App\Core\ActionCenter\Applications\Dto\AssistanceRequestDto;
use App\Core\ActionCenter\Applications\Dto\BeneficiaryDto;
use App\Core\Users\Application\Services\UserRoleCheckerService;
use App\Core\ActionCenter\Applications\Services\TransactionNumberGenerator;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\ActionCenter\Infrastructures\Repositories\AssistanceRequestRepositories;

use Illuminate\Support\Facades\DB;

class CreateAssistanceRequest
{

    public function __construct(
        protected UserRoleCheckerService $roleCheckerService,
        protected TransactionNumberGenerator $transactionNumber,
        protected IdGeneratorInterface $idGenerator,
        protected AssistanceRequestRepositories $assistanceRepository,
    ) {
    }

    public function execute(array $data, $user)
    {
        DB::beginTransaction();

        try {
            $isAdmin = $this->roleCheckerService->isAdmin($user);

            $status = $isAdmin
                ? RequestStatus::APPROVED->value
                : RequestStatus::PENDING->value;

            $userId = $user->id;
            $transactionNumber = $this->transactionNumber->generate();
            $assistanceId = $this->idGenerator->generate();
            $beneficiaryId = $this->idGenerator->generate();

            $request = new AssistanceRequestDto(
                $assistanceId,
                $transactionNumber,
                $data['assistance_type'],
                $data['description'],
                $status,
                $userId,
            );

            $beneficiary = new BeneficiaryDto(
                $beneficiaryId,
                $data['first_name'],
                $data['last_name'],
                $data['middle_name'] ?? null,
                $data['suffix'] ?? null,
                $data['birth_date'],
                $data['contact_number'],
                $data['province'],
                $data['municipality'],
                $data['barangay'],
            );
            
            $this->assistanceRepository->save($request, $beneficiary);
            DB::commit();//if successful

        } catch (\Throwable $e) {
            DB::rollback();
            throw $e;
        }

    }
}