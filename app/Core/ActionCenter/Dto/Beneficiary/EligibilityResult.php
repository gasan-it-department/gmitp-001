<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use Carbon\CarbonImmutable;
use DateTimeInterface;

/**
 * Outcome of CheckElegibilityAction.
 *
 * Designed so both the citizen Apply page and the store-side guard can read
 * the same object: the page renders the `message()` and disables the Apply
 * button when `!eligible`, the store action throws when `!eligible`.
 *
 * `cooldownEndsAt` is only populated for REASON_ON_COOLDOWN — used by the UI
 * to render "You may apply again on {date}".
 */
final class EligibilityResult
{
    public const REASON_ON_COOLDOWN = 'on_cooldown';

    public const REASON_PERMANENT_BLOCK = 'permanent_block';

    public const REASON_IN_FLIGHT = 'in_flight_request';

    public const REASON_BLACKLISTED = 'blacklisted';

    public const REASON_IDENTITY_UNVERIFIED = 'identity_unverified';

    public const REASON_DEPENDENT_UNVERIFIED = 'dependent_unverified';

    public const REASON_BENEFICIARY_INACTIVE = 'beneficiary_inactive';

    public const REASON_HOUSEHOLD_HEAD_REQUIRED = 'household_head_required';

    private function __construct(
        public readonly bool $eligible,
        public readonly ?string $reason,
        public readonly ?CarbonImmutable $cooldownEndsAt = null,
    ) {}

    public static function eligible(): self
    {
        return new self(true, null);
    }

    public static function onCooldown(DateTimeInterface $until): self
    {
        return new self(
            eligible: false,
            reason: self::REASON_ON_COOLDOWN,
            cooldownEndsAt: CarbonImmutable::instance($until),
        );
    }

    public static function permanentBlock(): self
    {
        return new self(false, self::REASON_PERMANENT_BLOCK);
    }

    public static function inFlightRequest(): self
    {
        return new self(false, self::REASON_IN_FLIGHT);
    }

    /**
     * An active blacklist flag exists on the identity group — a deliberate
     * admin hold (e.g. confirmed duplicate-account fraud). Hard-blocks all
     * standard self-service until an admin lifts it.
     */
    public static function blocked(): self
    {
        return new self(false, self::REASON_BLACKLISTED);
    }

    public static function identityUnverified(): self
    {
        return new self(false, self::REASON_IDENTITY_UNVERIFIED);
    }

    public static function dependentUnverified(): self
    {
        return new self(false, self::REASON_DEPENDENT_UNVERIFIED);
    }

    public static function beneficiaryInactive(): self
    {
        return new self(false, self::REASON_BENEFICIARY_INACTIVE);
    }

    public static function householdHeadRequired(): self
    {
        return new self(false, self::REASON_HOUSEHOLD_HEAD_REQUIRED);
    }

    public function requiresVerificationOverride(): bool
    {
        return in_array($this->reason, [
            self::REASON_IDENTITY_UNVERIFIED,
            self::REASON_DEPENDENT_UNVERIFIED,
        ], true);
    }

    /**
     * Human-readable explanation for citizen UI and admin tooltips.
     * Kept here (not in the frontend) so the same wording is used for both
     * the rendered page and any server-side flash message / exception.
     */
    public function message(): string
    {
        return match ($this->reason) {
            self::REASON_PERMANENT_BLOCK => 'You have already received this one-time assistance. '
                .'For anything further, please visit the MSWD office.',
            self::REASON_ON_COOLDOWN => sprintf(
                'You recently received assistance and can apply again on %s. '
                .'If you have an urgent need before then, please visit the MSWD office and our staff will assist you.',
                $this->cooldownEndsAt?->toFormattedDateString() ?? 'a later date',
            ),
            self::REASON_IN_FLIGHT => 'You already have a request being processed for this program. '
                .'We will notify you once it has been reviewed.',
            self::REASON_BLACKLISTED => 'There is a hold on your records that needs to be sorted out in person. '
                .'Please visit the MSWD office and our staff will assist you.',
            self::REASON_IDENTITY_UNVERIFIED => 'Your beneficiary profile is awaiting identity verification by MSWD. '
                .'You can apply after an administrator completes the review.',
            self::REASON_DEPENDENT_UNVERIFIED => 'This household member is still awaiting MSWD verification and cannot be selected yet.',
            self::REASON_BENEFICIARY_INACTIVE => 'Your beneficiary record is inactive. Please visit the MSWD office to update your residence or status.',
            self::REASON_HOUSEHOLD_HEAD_REQUIRED => 'Your household is temporarily on hold until MSWD assigns and verifies a head of household.',
            default => 'Eligible to apply.',
        };
    }

    /**
     * Shape consumed by Inertia / API consumers — flatten into a JSON-ready
     * array. Keep keys snake_case to match the rest of the action-center API.
     *
     * @return array{eligible: bool, reason: ?string, message: string, cooldown_ends_at: ?string}
     */
    public function toArray(): array
    {
        return [
            'eligible' => $this->eligible,
            'reason' => $this->reason,
            'message' => $this->message(),
            'cooldown_ends_at' => $this->cooldownEndsAt?->toIso8601String(),
        ];
    }
}
