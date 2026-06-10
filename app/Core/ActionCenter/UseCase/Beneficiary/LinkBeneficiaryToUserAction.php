<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\LinkBeneficiaryAccountDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Link a beneficiary record to a portal account — or change which account it
 * points to — as a deliberate, audited admin action performed at interview time
 * against the applicant's verified government ID.
 *
 * Two real-world cases this serves (see the Q&A that motivated it):
 *   1. A walk-in (user_id = NULL) later creates an online account. Linking keeps
 *      ONE lifelong record per person instead of spawning a duplicate, so the
 *      cross-program assistance history and the cooldown fan-out stay intact.
 *   2. A linked citizen lost access to their email and made a new account, or an
 *      earlier link was a mistake. "Changing" re-points user_id to the right
 *      account — and because it is sensitive, it REQUIRES a written reason.
 *
 * ── Invariant: one account ↔ one beneficiary ───────────────────────────────
 * ac_beneficiaries.user_id is UNIQUE (NULLs allowed for walk-ins). The DB is the
 * source of truth; this action surfaces the conflict as a friendly message and
 * points the admin at the other record (a conflict is itself a duplicate signal).
 *
 * ── Lock-order contract ─────────────────────────────────────────────────────
 * Inside one transaction, lock in PK order:
 *   1. ac_beneficiaries (the target row, lockForUpdate)
 *   2. ac_beneficiaries (the conflicting row, if any — lockForUpdate)
 * `attempts: 3` retries the rare serialization conflict; the unique constraint
 * is the final backstop if two admins race the same email onto two records.
 *
 * Hard gates (cheap → expensive):
 *   1. Tenant match    — beneficiary's household belongs to this municipality
 *   2. Account exists  — an account with that email exists IN this municipality
 *   3. Not a no-op     — not already linked to that same account
 *   4. Reason present  — required when CHANGING an already-linked account
 *   5. Account free     — that account isn't already owned by another record
 */
class LinkBeneficiaryToUserAction
{
    public function execute(LinkBeneficiaryAccountDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {
            // Lock the target row and load the household for the tenant guard.
            $beneficiary = Beneficiary::query()
                ->with('household')
                ->whereKey($dto->beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTenantMatch($beneficiary, $dto->municipalId);

            // Resolve the target account, scoped to THIS municipality so an admin
            // can never reach across tenants (case-insensitive, trimmed).
            $user = $this->resolveAccount($dto->accountEmail, $dto->municipalId);

            if ($beneficiary->user_id === $user->id) {
                throw new \DomainException('This beneficiary is already linked to that account.');
            }

            $previousUserId = $beneficiary->user_id;

            // Re-pointing an existing link is sensitive — demand a rationale.
            if ($previousUserId !== null && blank($dto->reason)) {
                throw new \DomainException(
                    'A reason is required when changing an account that is already linked.',
                );
            }

            $this->ensureAccountFree($user->id, $beneficiary->id);

            try {
                $beneficiary->update(['user_id' => $user->id]);
            } catch (QueryException $e) {
                // Lost a race to the unique(user_id) constraint. Anything that is
                // NOT a unique violation (e.g. a deadlock) is re-thrown so the
                // transaction's attempts:3 retry can handle it.
                if ($this->isUniqueViolation($e)) {
                    throw new \DomainException(
                        'That account was just linked to another beneficiary. Refresh and try again.',
                    );
                }

                throw $e;
            }

            $this->recordAudit($beneficiary, $user, $previousUserId, $dto);

            return $beneficiary->fresh(['household', 'user:id,email,first_name,last_name']);
        }, attempts: 3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Hard gates
    // ─────────────────────────────────────────────────────────────────────────

    private function ensureTenantMatch(Beneficiary $beneficiary, string $municipalId): void
    {
        // municipal_id lives on the household, not the beneficiary.
        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only manage beneficiaries from your own municipality.',
            );
        }
    }

    private function resolveAccount(string $email, string $municipalId): User
    {
        $user = User::query()
            ->where('municipal_id', $municipalId)
            ->whereRaw('LOWER(email) = ?', [mb_strtolower(trim($email))])
            ->first();

        if (!$user) {
            throw new \DomainException(
                'No portal account with that email exists in this municipality. '
                . 'Ask the applicant to confirm the email they registered with.',
            );
        }

        return $user;
    }

    private function ensureAccountFree(string $userId, string $beneficiaryId): void
    {
        $existing = Beneficiary::query()
            ->where('user_id', $userId)
            ->whereKeyNot($beneficiaryId)
            ->lockForUpdate()
            ->first();

        if ($existing) {
            throw new \DomainException(sprintf(
                'That account is already linked to another beneficiary record (%s). '
                . 'This is likely a duplicate — resolve it before re-linking.',
                trim($existing->full_name) ?: $existing->id,
            ));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Side effects
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Write the audit trail. user_id is intentionally NOT in the model's
     * LogsActivity::logOnly() set, so this explicit entry is the ONLY record of
     * a link change — it captures who, when, from which account, to which, and
     * why. (DPA RA 10173 + COA both want this trail.)
     */
    private function recordAudit(
        Beneficiary $beneficiary,
        User $user,
        ?string $previousUserId,
        LinkBeneficiaryAccountDto $dto,
    ): void {
        activity('beneficiary-account-link')
            ->performedOn($beneficiary)
            ->causedBy(User::find($dto->actingAdminId))
            ->withProperties([
                'municipal_id' => $dto->municipalId,
                'beneficiary_id' => $beneficiary->id,
                'from_user_id' => $previousUserId,
                'to_user_id' => $user->id,
                'to_account_email' => $user->email,
                'reason' => $dto->reason,
            ])
            ->log($previousUserId
                ? 'Re-linked beneficiary to a different portal account'
                : 'Linked beneficiary to a portal account');
    }

    /**
     * Portable unique-violation detection: Postgres (prod) reports SQLSTATE
     * 23505; SQLite (local/tests) carries "UNIQUE constraint failed" in the
     * message; MySQL uses 23000. Anything else is treated as a retryable error.
     */
    private function isUniqueViolation(QueryException $e): bool
    {
        $sqlState = (string) $e->getCode();

        if ($sqlState === '23505' || $sqlState === '23000') {
            return true;
        }

        return str_contains(strtolower($e->getMessage()), 'unique');
    }
}
