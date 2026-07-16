<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;

class EnsureBeneficiaryHasNoOpenAssistanceRequestAction
{
    public function execute(string $beneficiaryId): void
    {
        $openStatuses = array_map(
            fn (AssistanceStatus $status) => $status->value,
            array_filter(
                AssistanceStatus::cases(),
                fn (AssistanceStatus $status) => $status->isOpen(),
            ),
        );

        $hasOpenRequest = AssistanceRequest::query()
            ->where('beneficiary_id', $beneficiaryId)
            ->whereIn('status', $openStatuses)
            ->exists();

        if ($hasOpenRequest) {
            throw new \DomainException(
                'This beneficiary has an active assistance request. Finish, reject, cancel, or release the request before changing residence.',
            );
        }
    }
}
