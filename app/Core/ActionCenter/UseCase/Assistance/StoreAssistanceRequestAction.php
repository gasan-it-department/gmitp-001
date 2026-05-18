<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Orchestrator for citizen assistance requests.
 *
 *  1. Generate ULID + transaction number.
 *  2. Persist the request row (status = pending, amount_approved = NULL).
 *  3. Attach each uploaded document to the request's Spatie media
 *     "documents" collection on the private local disk. Each media row is
 *     tagged with the document_key custom property so the admin UI can
 *     present uploads grouped by their required-document slot.
 *  4. All inside a single DB transaction.
 *
 * Eligibility checks (cooldowns, blacklist flags) belong in a dedicated
 * CheckEligibilityAction called by the controller BEFORE this action runs.
 */
class StoreAssistanceRequestAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(StoreAssistanceRequestDto $dto): AssistanceRequest
    {

        $beneficiary = Beneficiary::findOrFail($dto->beneficiaryId);

        if ($beneficiary->household->municipal_id !== $dto->municipalId) {
            throw new AuthorizationException(
                'You may only request assistance from the municipality where you reside.'
            );
        }

        return DB::transaction(function () use ($dto) {
            $requestId = $this->idGenerator->generate();

            // When filing for a household member, resolve the snapshot fields
            // from the FK'd row so the citizen cannot forge a name by editing
            // the submitted payload. The FK must also belong to the filer's
            // own household — otherwise it's a cross-household tamper attempt.
            $member = $this->resolveOnBehalfMember($dto);

            $onBehalfFirstName = $member?->first_name ?? $dto->onBehalfFirstName;
            $onBehalfMiddleName = $member?->middle_name ?? $dto->onBehalfMiddleName;
            $onBehalfLastName = $member?->last_name ?? $dto->onBehalfLastName;
            $onBehalfSuffix = $member?->suffix ?? $dto->onBehalfSuffix;

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
                'relationship_to_beneficiary' => $dto->relationshipToBeneficiary,
                // 'on_behalf_household_member_id' => $member?->id,
                'on_behalf_first_name' => $onBehalfFirstName,
                'on_behalf_middle_name' => $onBehalfMiddleName,
                'on_behalf_last_name' => $onBehalfLastName,
                'on_behalf_suffix' => $onBehalfSuffix,
                'on_behalf_date_of_death' => $dto->onBehalfDateOfDeath,

                // Identity snapshot — frozen from ac_beneficiaries at submission time.
                'snapshot_first_name' => $dto->snapshotFirstName,
                'snapshot_last_name' => $dto->snapshotLastName,
                'snapshot_middle_name' => $dto->snapshotMiddleName,
                'snapshot_suffix' => $dto->snapshotSuffix,
                'snapshot_sex' => $dto->snapshotSex,
                'snapshot_birth_date' => $dto->snapshotBirthDate,
                'snapshot_educational_attainment' => $dto->snapshotEducationalAttainment,
                'snapshot_religion' => $dto->snapshotReligion,

                // Address snapshot — frozen from ac_households at submission time.
                'snapshot_barangay' => $dto->snapshotBarangay,
                'snapshot_barangay_psgc_code' => $dto->snapshotBarangayPsgcCode,
                'snapshot_street' => $dto->snapshotStreet,
            ]);

            $this->attachUploadedDocuments($request, $dto->documents);

            return $request->fresh(['media']);
        });
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
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $request
                ->addMedia($file)
                ->usingFileName($this->safeFileName($file))
                ->withCustomProperties([
                    'document_key' => $documentKey,
                ])
                ->toMediaCollection($documentKey, 'action_center');
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

        return $slug . ($extension ? ".{$extension}" : '');
    }

    /**
     * Loads the on-behalf household member, if one was selected, and verifies
     * it belongs to the filer's own household. Returns null when the request
     * is self-filed.
     */
    private function resolveOnBehalfMember(StoreAssistanceRequestDto $dto): ?HouseholdMember
    {
        if (!$dto->onBehalfHouseholdMemberId) {
            return null;
        }

        $member = HouseholdMember::find($dto->onBehalfHouseholdMemberId);

        if (!$member || $member->household_id !== $dto->householdId) {
            throw new AuthorizationException(
                'The selected family member does not belong to your household.'
            );
        }

        return $member;
    }

    /**
     * Format: #REQ-YYYY-XXXX where XXXX is a 4-digit sequence within the year.
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

        return sprintf('#REQ-%d-%04d', $year, $next);
    }
}
