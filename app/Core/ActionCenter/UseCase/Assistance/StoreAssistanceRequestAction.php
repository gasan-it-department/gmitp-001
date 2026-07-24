<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Exceptions\AssistanceEligibilityException;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Orchestrator shared by citizen preregistration and admin-encoded requests.
 *
 *  1. Lock the claimant, then the selected household member when present.
 *  2. Recheck citizen eligibility while those locks are held.
 *  3. Generate the ULID + transaction number and persist the request.
 *  4. Attach any admin-supplied documents to the request's Spatie media
 *     "documents" collection. Citizen preregistration always supplies an
 *     empty document set; MSWD completes evidence through the admin flow.
 *
 * The controller eligibility check is fast feedback. The transaction check is
 * the integrity boundary that closes concurrent-submission races.
 */
class StoreAssistanceRequestAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private AssistanceRequestSmsNotifier $smsNotifier,
        private CheckElegibilityAction $checkEligibility,
    ) {}

    public function execute(StoreAssistanceRequestDto $dto): AssistanceRequest
    {
        $assistanceType = AssistanceType::with('documents')->findOrFail($dto->assistanceTypeId);

        if ($assistanceType->municipal_id !== $dto->municipalId) {
            throw new AuthorizationException(
                'The selected assistance type does not belong to this municipality.'
            );
        }

        // Media uploads remain outside this transaction. The claimant/member
        // locks protect the eligibility check and request insert only.
        $request = DB::transaction(function () use (
            $dto,
            $assistanceType,
        ) {
            // Submission lock order is always claimant first, then the
            // selected recipient. Every citizen/admin store path shares this
            // action, so competing submissions cannot reverse that order.
            $beneficiary = Beneficiary::query()
                ->whereKey($dto->beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();
            $beneficiary->load(['household', 'religion']);

            if ($beneficiary->household_id !== $dto->householdId
                || $beneficiary->household?->municipal_id !== $dto->municipalId) {
                throw new AuthorizationException(
                    'You may only request assistance from the municipality where you reside.',
                );
            }

            if (! $beneficiary->is_active) {
                throw new \DomainException(
                    'This beneficiary record is inactive. Resolve the beneficiary residence or status before filing assistance.',
                );
            }

            if ($beneficiary->isIntakeRejected()) {
                throw new \DomainException(
                    'This beneficiary intake was rejected by MSWD. Reopen or correct the intake before filing assistance.',
                );
            }

            if (! $beneficiary->household->isVerified()) {
                throw new \DomainException(
                    'This household is on hold until an active, identity-verified head is assigned.',
                );
            }

            $member = $this->resolveOnBehalfMember($dto, $beneficiary, lock: true);
            $this->ensureVerificationGate($beneficiary, $dto);

            // The controller check is only fast feedback. This second complete
            // check runs after both serialization locks have been acquired.
            $eligibility = $this->checkEligibility->execute(
                $beneficiary,
                $assistanceType,
                $member?->id,
                $dto->onBehalfDateOfDeath,
                allowPendingDependent: $dto->encodedByUserId === null,
            );

            if (! $eligibility->eligible && $dto->encodedByUserId === null) {
                throw AssistanceEligibilityException::from($eligibility);
            }

            $recipientIdException = $this->recipientIdException($dto, $assistanceType, $member);
            $householdTotalIncome = $this->computeHouseholdTotalIncome($beneficiary);
            $requestId = $this->idGenerator->generate();

            $onBehalfFirstName = $member?->first_name ?? $dto->onBehalfFirstName;
            $onBehalfMiddleName = $member?->middle_name ?? $dto->onBehalfMiddleName;
            $onBehalfLastName = $member?->last_name ?? $dto->onBehalfLastName;
            $onBehalfSuffix = $member?->suffix ?? $dto->onBehalfSuffix;
            $relationshipToBeneficiary = $member?->relationship ?? $dto->relationshipToBeneficiary;

            $metadata = array_filter([
                'relationship_to_beneficiary' => $relationshipToBeneficiary,
                'on_behalf_first_name' => $onBehalfFirstName,
                'on_behalf_middle_name' => $onBehalfMiddleName,
                'on_behalf_last_name' => $onBehalfLastName,
                'on_behalf_suffix' => $onBehalfSuffix,
                'on_behalf_birth_date' => $member?->birth_date?->toDateString(),
                'on_behalf_date_of_death' => $dto->onBehalfDateOfDeath,
                'recipient_id_exception' => $recipientIdException,
                'recipient_id_exception_reason' => $recipientIdException === 'no_government_id'
                    ? $dto->recipientIdUnavailableReason
                    : null,
                'on_behalf_verification_pending' => $member !== null
                    && $member->relationship !== 'head'
                    && ! $member->is_verified_dependent
                        ? true
                        : null,
            ], static fn ($value) => $value !== null);

            $request = AssistanceRequest::create([
                'id' => $requestId,
                'municipal_id' => $dto->municipalId,
                'beneficiary_id' => $dto->beneficiaryId,
                'household_id' => $dto->householdId,
                'assistance_type_id' => $dto->assistanceTypeId,
                'encoded_by_user_id' => $dto->encodedByUserId, // null for online self-filed
                'transaction_number' => $this->generateTransactionNumber(),
                'status' => 'pending',
                'description' => $dto->description,

                // Amount intentionally NOT set. Approver fills amount_approved later.
                'amount_approved' => null,
                'approved_at' => null,
                'released_at' => null,

                // Data Privacy Act consent for this specific application.
                'privacy_consented_at' => $dto->privacyConsentedAt,
                'privacy_notice_version' => $dto->privacyNoticeVersion,

                // Representative — null when filing for self.
                // Frozen representative details; the roster link remains a real FK.
                'metadata' => $metadata !== [] ? $metadata : null,
                // Live FK to the roster row being assisted (null when self-filed or
                // when the subject — e.g. a deceased person — isn't on the roster).
                // The on_behalf_* fields below remain the frozen COA snapshot.
                'on_behalf_household_member_id' => $member?->id,

                // Identity snapshot — frozen from ac_beneficiaries at submission time.

                // Economic snapshot — read straight from the loaded beneficiary
                // for the three direct fields. The household total is the
                // value computed above against ac_household_members at the
                // moment of submission, frozen forever for COA traceability.

                // Address snapshot — frozen from ac_households at submission time.
            ]);

            $request->snapshot()->create([
                'first_name' => $dto->snapshotFirstName,
                'last_name' => $dto->snapshotLastName,
                'middle_name' => $dto->snapshotMiddleName,
                'suffix' => $dto->snapshotSuffix,
                'sex' => $dto->snapshotSex,
                'birth_date' => $dto->snapshotBirthDate,
                'educational_attainment' => $dto->snapshotEducationalAttainment,
                'religion' => $dto->snapshotReligion,
                'civil_status' => $beneficiary->civil_status?->value,
                'occupation' => $beneficiary->occupation,
                'monthly_income' => $beneficiary->monthly_income,
                'household_total_income' => $householdTotalIncome,
                'barangay' => $dto->snapshotBarangay,
                'barangay_psgc_code' => $dto->snapshotBarangayPsgcCode,
                'street' => $dto->snapshotStreet,
            ]);

            return $request;
        }, attempts: 3);

        // ── Media uploads run OUTSIDE the transaction. If a file write
        //    fails here, the request row is already committed and visible
        //    to admins with whatever documents DID attach. Re-submitting
        //    won't double-insert (ULID is unique). Orphan media files
        //    from a partial failure are cleaned up by Spatie's GC.
        $this->attachUploadedDocuments($request, $dto->documents);

        // Reload with the freshly-attached media so the return value
        // reflects the post-upload state (callers / API resources can
        // serialize `documents_uploaded` correctly on the very first read).
        $request = $request->fresh(['media', 'snapshot']);
        $this->smsNotifier->requestReceived($request);

        return $request;
    }

    /**
     * Sum the monthly income across every ACTIVE row in ac_household_members
     * for this beneficiary's household. The citizen themselves is one of
     * those rows (the "Head of Household" self-row written at registration
     * by CreateBeneficiaryProfileAction), so this SUM alone IS the total —
     * no need to add the beneficiary's income separately.
     *
     * The request snapshot row holds this value
     * immutably: even after the citizen's family composition or earnings
     * change, COA can still see the household income that justified the
     * original approval.
     */
    private function computeHouseholdTotalIncome(Beneficiary $beneficiary): float
    {
        return (float) HouseholdMember::query()
            ->where('household_id', $beneficiary->household_id)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('relationship', 'head')
                    ->orWhere('is_verified_dependent', true);
            })
            ->sum('monthly_income');
    }

    private function ensureVerificationGate(
        Beneficiary $beneficiary,
        StoreAssistanceRequestDto $dto,
    ): void {
        $message = null;

        if (! $beneficiary->isIdentityVerified()) {
            $message = 'The claimant identity has not been verified by MSWD.';
        } elseif ($dto->onBehalfHouseholdMemberId !== null) {
            $member = HouseholdMember::query()
                ->whereKey($dto->onBehalfHouseholdMemberId)
                ->where('household_id', $beneficiary->household_id)
                ->where('is_active', true)
                ->first();

            if ($member !== null
                && $member->relationship !== 'head'
                && ! $member->is_verified_dependent) {
                if (! $this->isAllowedPendingCitizenMember($beneficiary, $member, $dto)) {
                    $message = 'The selected household member has not been verified by MSWD.';
                }
            }
        }

        if ($message === null) {
            return;
        }

        if ($dto->encodedByUserId === null) {
            throw new \DomainException($message);
        }

        if (blank($dto->verificationOverrideReason)) {
            throw new \DomainException(
                $message.' Enter an override reason to continue as an administrator.',
            );
        }
    }

    private function recipientIdException(
        StoreAssistanceRequestDto $dto,
        AssistanceType $assistanceType,
        ?HouseholdMember $member,
    ): ?string {
        $isOnBehalf = $member !== null || filled($dto->onBehalfFirstName);

        if (! $isOnBehalf) {
            return null;
        }

        if ($assistanceType->slug === 'burial' || filled($dto->onBehalfDateOfDeath)) {
            return 'deceased';
        }

        if ($member?->birth_date !== null && $member->birth_date->age < 18) {
            return 'minor';
        }

        if ($dto->recipientIdUnavailable) {
            if (blank($dto->recipientIdUnavailableReason)
                || mb_strlen(trim($dto->recipientIdUnavailableReason)) < 10) {
                throw new \DomainException(
                    'Explain why the assisted adult cannot provide a government ID.',
                );
            }

            return 'no_government_id';
        }

        return null;
    }

    /**
     * Attach each uploaded document to the request's Spatie "documents"
     * media collection. The `document_key` custom property preserves the
     * mapping back to ac_document_types so the admin UI can group uploads
     * by their required-document slot (e.g. "Certificate of Indigency",
     * "Death Certificate").
     *
     * @param  array<string, UploadedFile>  $documents  keyed by ac_document_types.key
     */
    private function attachUploadedDocuments(AssistanceRequest $request, array $documents): void
    {
        foreach ($documents as $documentKey => $file) {

            if (! $file instanceof UploadedFile) {
                continue;
            }

            $request
                ->addMedia($file)
                ->usingFileName($this->safeFileName($file))
                ->withCustomProperties([
                    'document_key' => $documentKey,
                ])
                ->toMediaCollection('documents');
        }
    }

    /**
     * Spatie keeps the original filename for display, but we sanitise it
     * for on-disk storage so reserved characters don't collide with the
     * underlying filesystem (Windows local dev + Linux prod).
     */
    private function safeFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $base = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = preg_replace('/[^A-Za-z0-9_-]+/', '_', $base) ?: 'document';

        return $slug.($extension ? ".{$extension}" : '');
    }

    /**
     * Loads the on-behalf household member, if one was selected, and verifies
     * it belongs to the filer's own household. Returns null when the request
     * is self-filed.
     */
    private function resolveOnBehalfMember(
        StoreAssistanceRequestDto $dto,
        Beneficiary $beneficiary,
        bool $lock = false,
    ): ?HouseholdMember {
        if (! $dto->onBehalfHouseholdMemberId) {
            return null;
        }

        $query = HouseholdMember::query()->whereKey($dto->onBehalfHouseholdMemberId);

        if ($lock) {
            $query->lockForUpdate();
        }

        $member = $query->first();

        if (! $member || $member->household_id !== $dto->householdId) {
            throw new AuthorizationException(
                'The selected family member does not belong to your household.'
            );
        }

        if (! $member->is_active) {
            throw new AuthorizationException('The selected household member is no longer active.');
        }

        if ($member->relationship !== 'head'
            && ! $member->is_verified_dependent
            && ! $this->isAllowedPendingCitizenMember(
                $beneficiary,
                $member,
                $dto,
            )) {
            if ($dto->encodedByUserId === null || blank($dto->verificationOverrideReason)) {
                throw new AuthorizationException(
                    'The selected household member is awaiting MSWD verification.',
                );
            }
        }

        return $member;
    }

    private function isAllowedPendingCitizenMember(
        Beneficiary $beneficiary,
        HouseholdMember $member,
        StoreAssistanceRequestDto $dto,
    ): bool {
        if ($dto->encodedByUserId !== null
            || $beneficiary->user_id !== $dto->submitterUserId
            || $member->household_id !== $beneficiary->household_id
            || ! $member->is_active
            || $member->relationship === 'head'
            || $member->is_verified_dependent) {
            return false;
        }

        return HouseholdMember::query()
            ->where('household_id', $beneficiary->household_id)
            ->where('is_active', true)
            ->where('relationship', '!=', 'head')
            ->where('is_verified_dependent', false)
            ->whereKey($member->id)
            ->exists()
            && HouseholdMember::query()
                ->where('household_id', $beneficiary->household_id)
                ->where('is_active', true)
                ->where('relationship', '!=', 'head')
                ->where('is_verified_dependent', false)
                ->count() === 1;
    }

    /**
     * Format: REQ-YYYY-XXXX where XXXX is a 4-digit sequence within the year.
     *
     * Atomically reads-and-increments the per-year row in ac_request_sequences
     * under SELECT … FOR UPDATE so concurrent submissions never collide on the
     * `transaction_number` unique index. The lock is released when the enclosing
     * DB::transaction in execute() commits or rolls back.
     */
    private function generateTransactionNumber(): string
    {
        $year = (int) now()->year;

        $row = DB::table('ac_request_sequences')
            ->where('year', $year)
            ->lockForUpdate()
            ->first();

        if ($row) {
            $next = $row->last_seq + 1;

            DB::table('ac_request_sequences')
                ->where('year', $year)
                ->update([
                    'last_seq' => $next,
                    'updated_at' => now(),
                ]);
        } else {
            $next = 1;

            DB::table('ac_request_sequences')->insert([
                'year' => $year,
                'last_seq' => $next,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return sprintf('REQ-%d-%04d', $year, $next);
    }
}
