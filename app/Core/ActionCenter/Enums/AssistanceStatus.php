<?php

namespace App\Core\ActionCenter\Enums;

/**
 * The six states an assistance request can be in.
 *
 * Lifecycle (see canTransitionTo for the full rules):
 *
 *   PENDING ──► UNDER_REVIEW ──► APPROVED ──► RELEASED  (terminal, COA-immutable)
 *      │             │              │
 *      │             ├──► REJECTED  (terminal)
 *      │             │
 *      │             └──► PENDING   (reviewer asked for more info)
 *      │
 *      ├──► REJECTED   (rejected before any review)
 *      └──► CANCELLED  (citizen withdrew)
 *
 * COA invariant: once RELEASED, the row is financially immutable. No status
 * can move away from RELEASED — corrections are made via a new entry, not by
 * mutating the original.
 */
enum AssistanceStatus: string
{
    /** Submitted by the citizen, awaiting admin pickup. */
    case Pending = 'pending';

    /** Admin has the file open; documents being verified. */
    case UnderReview = 'under_review';

    /** Mayor / authorized approver signed off. Amount is now bound. */
    case Approved = 'approved';

    /** Cashier recorded the actual disbursement. COA-immutable. */
    case Released = 'released';

    /** Denied by the reviewer with remarks. */
    case Rejected = 'rejected';

    /** Citizen withdrew the application before it was acted on. */
    case Cancelled = 'cancelled';

    // ──────────────────────────────────────────────────────────────────────
    // Display helpers (frontend consumers)
    // ──────────────────────────────────────────────────────────────────────

    public function label(): string
    {
        return match ($this) {
            self::Pending     => 'Pending',
            self::UnderReview => 'Under Review',
            self::Approved    => 'Approved',
            self::Released    => 'Released',
            self::Rejected    => 'Rejected',
            self::Cancelled   => 'Cancelled',
        };
    }

    /** Tailwind classes used by the admin queue + detail status badge. */
    public function color(): string
    {
        return match ($this) {
            self::Pending     => 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
            self::UnderReview => 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
            self::Approved    => 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
            self::Released    => 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
            self::Rejected    => 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
            self::Cancelled   => 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
        };
    }

    // ──────────────────────────────────────────────────────────────────────
    // Lifecycle helpers (single source of truth for transition rules)
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Terminal states are write-protected — no further status change allowed.
     * The booted::updating model event consults this to reject mutations.
     */
    public function isTerminal(): bool
    {
        return match ($this) {
            self::Released, self::Rejected, self::Cancelled => true,
            default => false,
        };
    }

    /**
     * "Open" requests are the ones that block the eligibility check
     * (cross-program in-flight rule). Approved counts as open too —
     * the cooldown row exists but the release hasn't happened yet, so
     * we still don't want stacking benefits.
     */
    public function isOpen(): bool
    {
        return match ($this) {
            self::Pending, self::UnderReview, self::Approved => true,
            default => false,
        };
    }

    /**
     * Allowed transitions. Centralizing them here means the model event,
     * the controllers, and the React action buttons all agree on the rules.
     *
     * Note: PENDING ←→ UNDER_REVIEW is bidirectional on purpose — the
     * reviewer can bounce a request back when more info is needed.
     */
    public function canTransitionTo(self $next): bool
    {
        // Terminal states never move.
        if ($this->isTerminal()) {
            return false;
        }

        return match ($this) {
            self::Pending => in_array($next, [
                self::UnderReview,
                self::Rejected,
                self::Cancelled,
            ], true),

            self::UnderReview => in_array($next, [
                self::Pending,     // "Request more info" — bounce back
                self::Approved,
                self::Rejected,
                self::Cancelled,
            ], true),

            self::Approved => in_array($next, [
                self::Released,    // only forward path — to disbursement
                self::Cancelled,   // pre-release cancellation (rare; needs remarks)
            ], true),

            default => false,
        };
    }

    // ──────────────────────────────────────────────────────────────────────
    // Bulk shape (admin filter dropdown)
    // ──────────────────────────────────────────────────────────────────────

    /**
     * @return array<int, array{value: string, label: string, color: string}>
     */
    public static function toSelectOptions(): array
    {
        return array_map(
            fn (self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'color' => $case->color(),
            ],
            self::cases(),
        );
    }

    /** Values only — handy for `Rule::in(AssistanceStatus::values())` in validators. */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
