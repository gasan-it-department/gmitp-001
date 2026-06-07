<?php

namespace App\Core\ActionCenter\Exceptions;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Shared\Exceptions\Interfaces\DomainException;
use Illuminate\Support\Collection;

/**
 * Raised when an assistance request cannot be approved.
 *
 * Extends the shared App\Shared\Exceptions\Interfaces\DomainException so it is
 * picked up by the global renderer in bootstrap/app.php — which flashes the
 * message to `error` and surfaces it through FlashHandler as a toast. That is
 * why these are thrown instead of PHP's built-in \DomainException: the built-in
 * one is caught by the controller and buried in the (un-rendered) `approve`
 * error bag, so the admin never saw why the approval was blocked.
 *
 * Every approval hard-gate funnels through one of the named constructors below
 * so the messaging stays in a single place.
 */
class AssistanceApprovalException extends DomainException
{
    public static function invalidTransition(AssistanceStatus $status): self
    {
        return new self(match ($status) {
            AssistanceStatus::Pending   => 'This case is still pending — pick it up first before approving.',
            AssistanceStatus::Approved  => 'This case has already been approved.',
            AssistanceStatus::Released  => 'This case has already been released and cannot be re-approved.',
            AssistanceStatus::Rejected  => 'This case was rejected and cannot be approved.',
            AssistanceStatus::Cancelled => 'This case was cancelled and cannot be approved.',
            default                     => 'This case cannot be approved from its current state.',
        });
    }

    public static function noReviewerAssigned(): self
    {
        return new self('This case has no assigned reviewer. Pick it up first before approving.');
    }

    public static function amountBelowMinimum(float $minAmount): self
    {
        return new self(sprintf(
            'Approved amount must be at least ₱%s for this program.',
            number_format($minAmount, 2),
        ));
    }

    public static function amountAboveMaximum(float $maxAmount): self
    {
        return new self(sprintf(
            'Approved amount cannot exceed ₱%s for this program.',
            number_format($maxAmount, 2),
        ));
    }

    /**
     * @param  Collection<int, string>  $missingLabels  human-readable document labels (not keys)
     */
    public static function missingRequiredDocuments(Collection $missingLabels): self
    {
        return new self(
            'Cannot approve — the following required document(s) are missing: '
            . $missingLabels->implode(', '),
        );
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'ASSISTANCE_APPROVAL_BLOCKED';
    }
}
