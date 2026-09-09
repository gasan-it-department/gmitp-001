<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CorrectAssistanceRequestFilerNameDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceRequestSnapshot;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class CorrectAssistanceRequestFilerNameAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
    ) {}

    public function execute(CorrectAssistanceRequestFilerNameDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
            );

            $this->authorizeStatus($request, $dto);
            $this->ensureReason($dto->reason);

            $beneficiary = Beneficiary::query()
                ->whereKey($request->beneficiary_id)
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $beneficiary->isIdentityVerified()) {
                throw new \DomainException(
                    'Verify the corrected beneficiary identity before applying the name to this request.',
                );
            }

            $snapshot = AssistanceRequestSnapshot::query()
                ->where('assistance_request_id', $request->id)
                ->lockForUpdate()
                ->first();

            if ($snapshot === null) {
                throw new \DomainException('This request has no frozen filer snapshot to correct.');
            }

            $oldName = $this->nameValues($snapshot);
            $newName = $this->nameValues($beneficiary);

            if ($newName['first_name'] === null || $newName['last_name'] === null) {
                throw new \DomainException('The verified beneficiary profile must contain a first and last name.');
            }

            if ($oldName === $newName) {
                throw new \DomainException('The frozen filer name already matches the verified beneficiary profile.');
            }

            $snapshot->replaceFilerName($newName);

            $correctedAt = now();

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->correctedByUserId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'attributes' => $newName,
                    'old' => $oldName,
                    'corrected_by_user_id' => $dto->correctedByUserId,
                    'correction_reason' => $dto->reason,
                    'corrected_at' => $correctedAt->toIso8601String(),
                    'request_status' => $request->status->value,
                ])
                ->log('Corrected frozen filer name from verified beneficiary profile');

            return $request->fresh(['snapshot', 'beneficiary']);
        }, attempts: 3);
    }

    private function authorizeStatus(
        AssistanceRequest $request,
        CorrectAssistanceRequestFilerNameDto $dto,
    ): void {
        if ($request->released_at !== null
            || $request->released_by_user_id !== null
            || filled($request->release_reference_number)) {
            throw new \DomainException('A request with release information cannot use the filer-name correction workflow.');
        }

        if ($request->status === AssistanceStatus::Pending) {
            $this->requirePermission(
                $dto->canProcessRequests,
                'Processing permission is required to correct a pending request.',
            );

            return;
        }

        if ($request->status === AssistanceStatus::UnderReview) {
            $this->authorizeAssignedReviewer($request, $dto);

            return;
        }

        if ($request->status === AssistanceStatus::Approved) {
            $this->requirePermission(
                $dto->canCorrectRequests,
                'Approved requests require the controlled correction permission.',
            );

            return;
        }

        throw new \DomainException(
            'Only pending, under-review, or approved unreleased requests can have their frozen filer name corrected.',
        );
    }

    private function authorizeAssignedReviewer(
        AssistanceRequest $request,
        CorrectAssistanceRequestFilerNameDto $dto,
    ): void {
        $this->requirePermission(
            $dto->canProcessRequests,
            'Processing permission is required to correct a request under review.',
        );

        if ($request->reviewed_by_user_id !== $dto->correctedByUserId) {
            throw new AuthorizationException(
                'Only the assigned reviewer can apply the corrected filer name while this request is under review.',
            );
        }
    }

    private function requirePermission(bool $allowed, string $message): void
    {
        if (! $allowed) {
            throw new AuthorizationException($message);
        }
    }

    private function ensureReason(string $reason): void
    {
        $length = mb_strlen(trim($reason));

        if ($length < 10 || $length > 1000) {
            throw new \DomainException('The correction reason must contain between 10 and 1,000 characters.');
        }
    }

    /** @return array{first_name: ?string, middle_name: ?string, last_name: ?string, suffix: ?string} */
    private function nameValues(object $person): array
    {
        return [
            'first_name' => $this->namePart($person->first_name),
            'middle_name' => $this->namePart($person->middle_name),
            'last_name' => $this->namePart($person->last_name),
            'suffix' => $this->namePart($person->suffix),
        ];
    }

    private function namePart(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
