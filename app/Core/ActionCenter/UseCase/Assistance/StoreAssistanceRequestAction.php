<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceRequestFile;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Orchestrator for citizen assistance requests.
 *
 *  1. Generate ULID + transaction number.
 *  2. Persist the request row (status = pending, amount_approved = NULL).
 *  3. Store each uploaded document on the private 'requests' disk and
 *     write its metadata row into ac_assistance_request_files.
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
        return DB::transaction(function () use ($dto) {
            $requestId = $this->idGenerator->generate();

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
                'on_behalf_first_name' => $dto->onBehalfFirstName,
                'on_behalf_middle_name' => $dto->onBehalfMiddleName,
                'on_behalf_last_name' => $dto->onBehalfLastName,
                'on_behalf_suffix' => $dto->onBehalfSuffix,
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

            $this->storeUploadedFiles($request, $dto->documents);

            return $request->fresh(['files']);
        });
    }

    /**
     * @param  array<string, UploadedFile>  $documents  keyed by ac_document_types.key
     */
    private function storeUploadedFiles(AssistanceRequest $request, array $documents): void
    {
        foreach ($documents as $documentKey => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            // Private disk — files are NOT publicly accessible. Admin downloads them
            // through an authenticated controller route.
            $path = $file->store("requests/{$request->id}", 'requests');

            AssistanceRequestFile::create([
                'id' => $this->idGenerator->generate(),
                'assistance_request_id' => $request->id,
                'document_type' => $documentKey,
                'public_id' => $path,
                'mime_type' => $file->getMimeType(),
                'resource_type' => str_starts_with((string) $file->getMimeType(), 'image/') ? 'image' : 'raw',
                'original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
            ]);
        }
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
