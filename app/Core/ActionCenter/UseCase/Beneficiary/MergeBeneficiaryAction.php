<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryFlag;
use App\Core\Users\Models\User;
use App\Core\Users\UseCases\DeactivateAdminUseCase;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Non-destructive duplicate merge: link a DUPLICATE beneficiary into the
 * CANONICAL record it really is, neutralise the duplicate's account, and flag
 * the canonical — WITHOUT touching a single frozen (COA) request.
 *
 * What this does NOT do, deliberately: it never deletes the duplicate, never
 * moves or repoints any ac_assistance_request (released rows are immutable
 * financial records), and never reassigns the duplicate's user_id. The duplicate
 * row stays exactly where it is; eligibility, history and search resolve the
 * canonical + its duplicates as ONE identity group at query time
 * (ResolveBeneficiaryIdentityGroupAction). That's what stops the two-accounts
 * double-dip — the moment the link exists the duplicate's cooldowns are seen as
 * the canonical's.
 *
 * Mirrors LinkHouseholdMemberToBeneficiaryAction: tenant guard → resolve the
 * target by its human-friendly beneficiary_number within the acting tenant →
 * cheap-to-expensive guards → mutate under a row lock → audit.
 *
 * `attempts: 3` retries transient serialization failures; the domain guards are
 * \DomainException / AuthorizationException and do not retry.
 */
class MergeBeneficiaryAction
{
    public function __construct(
        private readonly DeactivateAdminUseCase $deactivateAccount,
    ) {
    }

    public function execute(
        string $duplicateId,
        string $canonicalBeneficiaryNumber,
        string $municipalId,
        string $actingAdminId,
        bool $wasImproperClaim,
        ?string $notes = null,
    ): Beneficiary {
        return DB::transaction(function () use (
            $duplicateId,
            $canonicalBeneficiaryNumber,
            $municipalId,
            $actingAdminId,
            $wasImproperClaim,
            $notes,
        ) {
            $duplicate = Beneficiary::query()
                ->with('household')
                ->whereKey($duplicateId)
                ->lockForUpdate()
                ->firstOrFail();

            // 1. Tenant guard — the duplicate's household must be in this LGU.
            if ($duplicate->household?->municipal_id !== $municipalId) {
                throw new AuthorizationException(
                    'You may only merge beneficiaries from your own municipality.',
                );
            }

            // 2. Resolve the canonical by beneficiary_number, scoped to tenant.
            $canonical = Beneficiary::query()
                ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId))
                ->where('beneficiary_number', mb_strtoupper(trim($canonicalBeneficiaryNumber)))
                ->first();

            if (! $canonical) {
                throw new \DomainException(
                    'No beneficiary with that number exists in this municipality. Check the number (e.g. GAS-000123) and try again.',
                );
            }

            // 3. Guards (cheap → expensive).
            if ($canonical->id === $duplicate->id) {
                throw new \DomainException('A record cannot be merged into itself.');
            }

            if ($duplicate->merged_into_beneficiary_id !== null) {
                throw new \DomainException('This record has already been merged into another beneficiary.');
            }

            if ($canonical->merged_into_beneficiary_id !== null) {
                throw new \DomainException(
                    'The target you chose is itself a merged duplicate. Merge into the canonical record instead.',
                );
            }

            // 4. Stamp the link. Frozen records are NOT moved — group-resolution
            //    at read time covers eligibility + history.
            $duplicate->update(['merged_into_beneficiary_id' => $canonical->id]);

            // 5. Neutralise the duplicate's portal account (revoke + deactivate;
            //    login is blocked while deactivated_at is set). Walk-ins have no
            //    account — nothing to do. user_id stays on the duplicate; the
            //    canonical keeps its own account.
            if ($duplicate->user_id !== null) {
                $this->deactivateAccount->execute($duplicate->user_id);
            }

            // 6. Flag the canonical. A confirmed improper second payout is a hard
            //    blacklist (blocks self-service until an admin lifts it); an
            //    administrative dedup with no improper claim is a warning.
            BeneficiaryFlag::create([
                'beneficiary_id' => $canonical->id,
                'user_id'        => $actingAdminId,
                'reason'         => 'duplicate_merge',
                'severity'       => $wasImproperClaim
                    ? BeneficiaryFlag::SEVERITY_BLACKLIST
                    : BeneficiaryFlag::SEVERITY_WARNING,
                'notes'          => $this->buildFlagNotes($duplicate, $wasImproperClaim, $notes),
            ]);

            // 7. Audit — explicit, with both identities and the acting admin.
            activity('beneficiary-merge')
                ->performedOn($canonical)
                ->causedBy(User::find($actingAdminId))
                ->withProperties([
                    'municipal_id'                => $municipalId,
                    'canonical_beneficiary_id'    => $canonical->id,
                    'canonical_beneficiary_number' => $canonical->beneficiary_number,
                    'duplicate_beneficiary_id'    => $duplicate->id,
                    'duplicate_beneficiary_number' => $duplicate->beneficiary_number,
                    'was_improper_claim'          => $wasImproperClaim,
                ])
                ->log('Merged a duplicate beneficiary into a canonical record');

            return $canonical->fresh();
        }, attempts: 3);
    }

    /**
     * Compose the audit note for the canonical's flag: the duplicate's identity,
     * its released-request transaction numbers (the disbursements that already
     * happened on the second identity, for COA follow-up), and any admin note.
     */
    private function buildFlagNotes(Beneficiary $duplicate, bool $wasImproperClaim, ?string $adminNotes): string
    {
        $releasedRefs = AssistanceRequest::query()
            ->where('beneficiary_id', $duplicate->id)
            ->where('status', 'released')
            ->orderByDesc('released_at')
            ->pluck('transaction_number')
            ->filter()
            ->all();

        $parts = [
            sprintf(
                'Merged duplicate %s (id %s) into this record.',
                $duplicate->beneficiary_number ?? '—',
                $duplicate->id,
            ),
        ];

        if ($wasImproperClaim) {
            $parts[] = 'Flagged as an improper second claim (blacklist hold).';
        }

        if (! empty($releasedRefs)) {
            $parts[] = 'Duplicate released requests: ' . implode(', ', $releasedRefs) . '.';
        }

        if (filled($adminNotes)) {
            $parts[] = trim($adminNotes);
        }

        return implode(' ', $parts);
    }
}
