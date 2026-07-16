<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Support\Collection;

/**
 * The fully-assembled payload for rendering a beneficiary's intake sheet.
 *
 * Built by GenerateBeneficiaryIntakeSheetAction; consumed by
 * BeneficiaryIntakeSheetPdf (and any future Excel renderer).
 *
 * ── Why this is a Read DTO, not a primitives DTO ─────────────────────
 * The workflow DTOs (Approve/Reject/Cancel/Release) carry only scalars
 * because they're built from validated request input and have to cross
 * the controller→action boundary without leaking framework concerns.
 *
 * This DTO is built FROM models (after queries have run inside the
 * action) and consumed by a Blade template, so passing the loaded
 * Eloquent instances directly is the practical choice — the renderer
 * accesses `$beneficiary->full_name`, `$member->relationship->label()`,
 * etc. exactly as if it were a normal model. Flattening to scalars here
 * would just duplicate every accessor in the DTO.
 */
readonly class BeneficiaryIntakeSheetData
{
    public function __construct(
        public Beneficiary $beneficiary,
        /** @var Collection<int, \App\Core\ActionCenter\Models\HouseholdMember> head first, then by created_at */
        public Collection $householdMembers,
        public float $householdTotalMonthlyIncome,
        public ?string $municipalityName,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
        public bool $hasIdentityIdFront,
        public bool $hasIdentityIdBack,
    ) {
    }
}
