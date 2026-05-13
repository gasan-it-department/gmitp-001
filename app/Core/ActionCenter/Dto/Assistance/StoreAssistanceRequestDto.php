<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;

/**
 * Immutable input to StoreAssistanceRequestAction.
 *
 * All identity / address snapshot fields are resolved from the authenticated
 * beneficiary's server-side record — NEVER trusted from the request payload —
 * so the citizen cannot spoof someone else's identity by tampering with form
 * values.
 *
 * The only "free text" identity values that COME FROM the request are the
 * `onBehalf*` representative fields, since they describe a *different* person
 * (e.g. a deceased family member for a burial claim).
 *
 * No amount field: the citizen does not propose an amount. amount_approved is
 * set only at approval time.
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
        public array $documents,

        // ── Data Privacy Act (RA 10173) consent ──────────────────────────────
        // Server-side evidence that the citizen agreed to the privacy notice
        // for THIS specific application. Timestamp comes from the server clock,
        // not the client, so it cannot be back-dated.
        public CarbonImmutable $privacyConsentedAt,
        public string $privacyNoticeVersion,

        // ── Representative ("filing on behalf of") ───────────────────────────
        // Null when the citizen is filing for themselves. Burial always uses
        // these (the beneficiary IS the representative; the deceased is captured
        // here).
        public ?string $relationshipToBeneficiary,
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
            documents: $request->file('documents', []),

            // Consent is server-stamped. The FormRequest enforced `accepted`;
            // arriving here means the citizen ticked the box.
            privacyConsentedAt: CarbonImmutable::now(),
            privacyNoticeVersion: self::PRIVACY_NOTICE_VERSION,

            // Representative info — only present when filing for a family member.
            // Frontend sends null/empty when filing for self; we normalise to null.
            relationshipToBeneficiary: $request->input('relationship_to_beneficiary') ?: null,
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
