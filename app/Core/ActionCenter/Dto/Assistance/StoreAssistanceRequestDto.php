<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\External\Api\Request\ActionCenter\StoreAdminAssistanceRequest;
use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;

/**
 * Immutable input to StoreAssistanceRequestAction.
 */
readonly class StoreAssistanceRequestDto
{
    /**
     * The privacy notice version the citizen consents to when ticking the
     * checkbox on the apply form. Bump this when the notice copy materially
     * changes — every subsequent submission will then be tagged with the new
     * version, while historical rows remain pinned to whichever version they
     * actually agreed to.
     */
    public const PRIVACY_NOTICE_VERSION = 'v1.0';

    /**
     * @param  array<string, UploadedFile>  $documents  keyed by ac_document_types.key
     */
    public function __construct(
        public string $municipalId,
        public string $beneficiaryId,
        public string $householdId,
        public string $assistanceTypeId,
        public string $submitterUserId,
        public ?string $encodedByUserId,   // null for self-filed online; admin user id for walk-in
        public string $description,

        // ── Data Privacy Act (RA 10173) consent ──────────────────────────────
        public CarbonImmutable $privacyConsentedAt,
        public string $privacyNoticeVersion,

        // ── Representative ("filing on behalf of") ───────────────────────────
        // Null when the citizen is filing for themselves. Burial always uses
        // these (the beneficiary IS the representative; the deceased is captured
        // here).
        //
        // onBehalfHouseholdMemberId is the FK to ac_household_members. When set,
        // the action resolves the on_behalf_* snapshot fields from that row
        // (the client-supplied name strings are ignored) so the snapshot cannot
        // be tampered with by editing the submitted form values.
        public ?string $relationshipToBeneficiary,
        public ?string $onBehalfHouseholdMemberId,
        public ?string $onBehalfFirstName,
        public ?string $onBehalfMiddleName,
        public ?string $onBehalfLastName,
        public ?string $onBehalfSuffix,
        public ?string $onBehalfDateOfDeath,   // burial only

        // ── Identity snapshot ────────────────────────────────────────────────
        // Frozen copy of ac_beneficiaries at submission time. Pulled from the
        // resolved $beneficiary, never from request input.
        public string $snapshotFirstName,
        public string $snapshotLastName,
        public ?string $snapshotMiddleName,
        public ?string $snapshotSuffix,
        public ?string $snapshotSex,
        public ?string $snapshotBirthDate,
        public ?string $snapshotEducationalAttainment,
        public ?string $snapshotReligion,

        // ── Address snapshot ─────────────────────────────────────────────────
        // Frozen copy of ac_households at submission time. Province omitted;
        // municipal_id already captures that context.
        public ?string $snapshotBarangay,
        public ?string $snapshotBarangayPsgcCode,
        public ?string $snapshotStreet,
        public array $documents = [],

    ) {
    }

    /**
     * Build the DTO from a validated request, the route-bound AssistanceType,
     * and the authenticated beneficiary (resolved by the controller).
     */
    public static function fromRequest(
        StoreAssistanceRequest $request,
        AssistanceType $assistanceType,
        Beneficiary $beneficiary,
    ): self {
        // The frontend posts `documents` as a flat dictionary
        //   documents[<document_key>] = <UploadedFile>
        // where <document_key> is the ac_document_types.key slug. We forward
        // exactly that shape to the action; Spatie's addMedia() needs the
        // UploadedFile, and the key is preserved as a custom property so the
        // admin UI can group uploads by required-document slot.
        $documents = [];

        foreach ((array) $request->file('documents', []) as $documentKey => $file) {
            if ($file instanceof UploadedFile) {
                $documents[$documentKey] = $file;
            }
        }

        $household = $beneficiary->household;

        // Resolve religion name (snapshot the human-readable label, not the FK ULID)
        $religionName = $beneficiary->relationLoaded('religion')
            ? $beneficiary->religion?->name
            : ($beneficiary->religion_id ? $beneficiary->religion()->value('name') : null);

        return new self(
            municipalId: $assistanceType->municipal_id,
            beneficiaryId: $beneficiary->id,
            householdId: $household->id,
            assistanceTypeId: $assistanceType->id,
            submitterUserId: $request->user()->id,
            encodedByUserId: null, // online self-filed; admin walk-ins set this elsewhere
            description: $request->validated('description'),
            documents: $documents,

            // Consent is server-stamped. The FormRequest enforced `accepted`;
            // arriving here means the citizen ticked the box.
            privacyConsentedAt: CarbonImmutable::now(),
            privacyNoticeVersion: self::PRIVACY_NOTICE_VERSION,

            // Representative info — only present when filing for a family member.
            // Frontend sends null/empty when filing for self; we normalise to null.
            relationshipToBeneficiary: $request->input('relationship_to_beneficiary') ?: null,
            onBehalfHouseholdMemberId: $request->input('on_behalf_household_member_id') ?: null,
            onBehalfFirstName: $request->input('on_behalf_first_name') ?: null,
            onBehalfMiddleName: $request->input('on_behalf_middle_name') ?: null,
            onBehalfLastName: $request->input('on_behalf_last_name') ?: null,
            onBehalfSuffix: $request->input('on_behalf_suffix') ?: null,
            onBehalfDateOfDeath: $request->input('on_behalf_date_of_death') ?: null,

            // Identity snapshot from the beneficiary at submission time.
            snapshotFirstName: $beneficiary->first_name,
            snapshotLastName: $beneficiary->last_name,
            snapshotMiddleName: $beneficiary->middle_name,
            snapshotSuffix: $beneficiary->suffix,
            snapshotSex: $beneficiary->sex,
            snapshotBirthDate: $beneficiary->birth_date?->toDateString(),
            snapshotEducationalAttainment: $beneficiary->educational_attainment,
            snapshotReligion: $religionName,

            // Address snapshot from the household at submission time.
            snapshotBarangay: $household->barangay,
            snapshotBarangayPsgcCode: $household->barangay_psgc_code,
            snapshotStreet: $household->street,
        );
    }

    /**
     * Build the DTO for an ADMIN-encoded request (walk-in counter, or filed on
     * behalf of an online beneficiary who cannot use the portal).
     *
     * Identical to fromRequest in every snapshot it freezes — identity, address
     * and economic data still come ONLY from the resolved beneficiary, never
     * from request input — with two differences:
     *
     *   • `encodedByUserId` AND `submitterUserId` are the acting admin's id
     *     (the citizen has no account in the walk-in case).
     *   • The assistance type and beneficiary are resolved by the controller
     *     from the submitted ids, not from a route-model binding.
     *
     * Documents are optional here (the admin verifies physical originals at the
     * desk); whatever was attached is forwarded exactly as in the online flow.
     */
    public static function fromAdmin(
        StoreAdminAssistanceRequest $request,
        AssistanceType $assistanceType,
        Beneficiary $beneficiary,
        string $adminUserId,
    ): self {
        $documents = [];

        foreach ((array) $request->file('documents', []) as $documentKey => $file) {
            if ($file instanceof UploadedFile) {
                $documents[$documentKey] = $file;
            }
        }

        $household = $beneficiary->household;

        $religionName = $beneficiary->relationLoaded('religion')
            ? $beneficiary->religion?->name
            : ($beneficiary->religion_id ? $beneficiary->religion()->value('name') : null);

        return new self(
            municipalId: $assistanceType->municipal_id,
            beneficiaryId: $beneficiary->id,
            householdId: $household->id,
            assistanceTypeId: $assistanceType->id,
            // The admin is both the submitter (operated the system) and the
            // encoder (recorded it on someone's behalf).
            submitterUserId: $adminUserId,
            encodedByUserId: $adminUserId,
            description: $request->validated('description'),
            documents: $documents,

            // Consent is the admin's on-behalf affirmation. The FormRequest
            // enforced `accepted`; arriving here means the box was ticked.
            privacyConsentedAt: CarbonImmutable::now(),
            privacyNoticeVersion: self::PRIVACY_NOTICE_VERSION,

            // Representative info — only present when filing for a family member.
            relationshipToBeneficiary: $request->input('relationship_to_beneficiary') ?: null,
            onBehalfHouseholdMemberId: $request->input('on_behalf_household_member_id') ?: null,
            onBehalfFirstName: $request->input('on_behalf_first_name') ?: null,
            onBehalfMiddleName: $request->input('on_behalf_middle_name') ?: null,
            onBehalfLastName: $request->input('on_behalf_last_name') ?: null,
            onBehalfSuffix: $request->input('on_behalf_suffix') ?: null,
            onBehalfDateOfDeath: $request->input('on_behalf_date_of_death') ?: null,

            // Identity snapshot from the beneficiary at submission time.
            snapshotFirstName: $beneficiary->first_name,
            snapshotLastName: $beneficiary->last_name,
            snapshotMiddleName: $beneficiary->middle_name,
            snapshotSuffix: $beneficiary->suffix,
            snapshotSex: $beneficiary->sex,
            snapshotBirthDate: $beneficiary->birth_date?->toDateString(),
            snapshotEducationalAttainment: $beneficiary->educational_attainment,
            snapshotReligion: $religionName,

            // Address snapshot from the household at submission time.
            snapshotBarangay: $household->barangay,
            snapshotBarangayPsgcCode: $household->barangay_psgc_code,
            snapshotStreet: $household->street,
        );
    }
}
