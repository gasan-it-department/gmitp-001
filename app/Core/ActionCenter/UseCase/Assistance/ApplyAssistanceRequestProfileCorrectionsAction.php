<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ApplyAssistanceRequestProfileCorrectionsDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\MswdVerificationStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceRequestSnapshot;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class ApplyAssistanceRequestProfileCorrectionsAction
{
    private const SUPPORTED_FIELDS = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'sex',
        'birth_date',
        'educational_attainment',
        'religion',
        'civil_status',
        'occupation',
        'monthly_income',
    ];

    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
    ) {}

    public function execute(ApplyAssistanceRequestProfileCorrectionsDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
            );

            $verificationWasComplete = $request->mswd_verification_status === MswdVerificationStatus::Verified;
            $this->authorizeStatus($request, $dto, $verificationWasComplete);
            $request->assertNoActiveDisbursement();
            $this->ensureReason($dto->reason);
            $this->ensureSupportedFields($dto->fields);

            $beneficiary = Beneficiary::query()
                ->with('religion')
                ->whereKey($request->beneficiary_id)
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $beneficiary->isIdentityVerified()) {
                throw new \DomainException(
                    'Verify the corrected beneficiary profile before applying its details to this request.',
                );
            }

            $snapshot = AssistanceRequestSnapshot::query()
                ->where('assistance_request_id', $request->id)
                ->lockForUpdate()
                ->first();

            if ($snapshot === null) {
                throw new \DomainException('This request has no frozen claimant snapshot to correct.');
            }

            $profileValues = $this->profileValues($beneficiary);
            if ($profileValues['birth_date'] !== null
                && $request->created_at !== null
                && $profileValues['birth_date'] > $request->created_at->toDateString()) {
                throw new \DomainException('The corrected birth date cannot be after the request submission date.');
            }

            $old = [];
            $attributes = [];
            foreach ($dto->fields as $field) {
                $oldValue = $this->normalizedValue($field, $snapshot->getAttribute($field));
                $newValue = $this->normalizedValue($field, $profileValues[$field]);

                if ($oldValue === $newValue) {
                    continue;
                }

                $old[$field] = $oldValue;
                $attributes[$field] = $newValue;
            }

            if ($attributes === []) {
                throw new \DomainException('The selected request fields already match the verified beneficiary profile.');
            }

            $snapshot->replaceClaimantProfileFields($attributes);
            $this->invalidateVerification($request, $dto->reason, $verificationWasComplete);

            $correctedAt = now();
            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->correctedByUserId))
                ->withProperties([
                    'event' => 'claimant_snapshot_corrected',
                    'municipal_id' => $dto->municipalId,
                    'attributes' => $attributes,
                    'old' => $old,
                    'corrected_fields' => array_keys($attributes),
                    'corrected_by_user_id' => $dto->correctedByUserId,
                    'correction_reason' => $dto->reason,
                    'corrected_at' => $correctedAt->toIso8601String(),
                    'request_status' => $request->status->value,
                    'mswd_verification_reopened' => $verificationWasComplete,
                ])
                ->log('Applied verified beneficiary profile corrections to frozen claimant snapshot');

            return $request->fresh(['snapshot', 'beneficiary.religion']);
        }, attempts: 3);
    }

    private function authorizeStatus(
        AssistanceRequest $request,
        ApplyAssistanceRequestProfileCorrectionsDto $dto,
        bool $verificationWasComplete,
    ): void {
        if ($request->hasReleaseArtifacts()) {
            throw new \DomainException('A request with release information cannot have its claimant snapshot corrected.');
        }

        if ($verificationWasComplete) {
            $this->requirePermission(
                $dto->canCorrectRequests,
                'Correction permission is required because MSWD verification is already complete.',
            );

            if (! in_array($request->status, [AssistanceStatus::UnderReview, AssistanceStatus::Approved], true)) {
                throw new \DomainException('Only an under-review or approved unreleased request can reopen completed verification for correction.');
            }

            return;
        }

        if ($request->status === AssistanceStatus::Pending) {
            $this->requirePermission(
                $dto->canProcessRequests,
                'Processing permission is required to correct a pending request.',
            );

            return;
        }

        if ($request->status === AssistanceStatus::UnderReview) {
            $this->requirePermission(
                $dto->canProcessRequests,
                'Processing permission is required to correct a request under review.',
            );

            if ($request->reviewed_by_user_id !== $dto->correctedByUserId) {
                throw new AuthorizationException(
                    'Only the assigned reviewer can apply profile corrections while this request is under review.',
                );
            }

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
            'Only pending, under-review, or approved unreleased requests can have their claimant snapshot corrected.',
        );
    }

    private function invalidateVerification(
        AssistanceRequest $request,
        string $reason,
        bool $verificationWasComplete,
    ): void {
        $attributes = [
            'mswd_verified_by_user_id' => null,
            'mswd_verified_at' => null,
            'mswd_verification_fingerprint' => null,
        ];

        if ($verificationWasComplete) {
            $attributes['mswd_verification_status'] = MswdVerificationStatus::UnderReview;
            $attributes['mswd_verification_notes'] = 'Claimant snapshot corrected: '.trim($reason);
        }

        $request->updateMswdVerification($attributes);
    }

    /** @return array<string, string|float|null> */
    private function profileValues(Beneficiary $beneficiary): array
    {
        return [
            'first_name' => $this->stringValue($beneficiary->first_name),
            'middle_name' => $this->stringValue($beneficiary->middle_name),
            'last_name' => $this->stringValue($beneficiary->last_name),
            'suffix' => $this->stringValue($beneficiary->suffix),
            'sex' => $this->stringValue($beneficiary->getRawOriginal('sex')),
            'birth_date' => $beneficiary->birth_date?->toDateString(),
            'educational_attainment' => $this->stringValue($beneficiary->getRawOriginal('educational_attainment')),
            'religion' => $this->stringValue($beneficiary->religion?->name),
            'civil_status' => $this->stringValue($beneficiary->getRawOriginal('civil_status')),
            'occupation' => $this->stringValue($beneficiary->occupation),
            'monthly_income' => $beneficiary->monthly_income !== null
                ? (float) $beneficiary->monthly_income
                : null,
        ];
    }

    private function normalizedValue(string $field, mixed $value): string|float|null
    {
        if ($field === 'birth_date') {
            return $value instanceof \DateTimeInterface
                ? $value->format('Y-m-d')
                : $this->stringValue($value);
        }

        if ($field === 'monthly_income') {
            return $value !== null && is_numeric($value) ? (float) $value : null;
        }

        return $this->stringValue($value);
    }

    private function stringValue(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /** @param list<string> $fields */
    private function ensureSupportedFields(array $fields): void
    {
        if ($fields === [] || array_diff($fields, self::SUPPORTED_FIELDS) !== []) {
            throw new \DomainException('Select at least one supported beneficiary profile correction.');
        }
    }

    private function ensureReason(string $reason): void
    {
        $length = mb_strlen(trim($reason));

        if ($length < 10 || $length > 1000) {
            throw new \DomainException('The correction reason must contain between 10 and 1,000 characters.');
        }
    }

    private function requirePermission(bool $allowed, string $message): void
    {
        if (! $allowed) {
            throw new AuthorizationException($message);
        }
    }
}
