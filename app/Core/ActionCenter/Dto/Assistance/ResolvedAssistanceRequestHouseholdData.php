<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * The household roster saved for one assistance request.
 */
readonly class ResolvedAssistanceRequestHouseholdData
{
    public const SOURCE_ASSESSMENT = 'assessment';

    public const SOURCE_FILING = 'filing';

    public const SOURCE_LEGACY_CURRENT_FALLBACK = 'legacy_current_fallback';

    public function __construct(
        public ?string $householdId,
        public ?string $householdCode,
        /** @var Collection<int, AssistanceRequestHouseholdMemberData> */
        public Collection $members,
        public ?CarbonImmutable $capturedAt,
        /** @var self::SOURCE_* */
        public string $source,
        public bool $usesCurrentFallback,
    ) {}
}
