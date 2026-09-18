<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Core\ActionCenter\Enums\BeneficiaryAssistanceRole;
use App\Core\ActionCenter\Models\AssistanceRequest;

final readonly class BeneficiaryAssistanceHistoryEntry
{
    public function __construct(
        public AssistanceRequest $request,
        public BeneficiaryAssistanceRole $role,
        public string $filerFullName,
        public string $subjectFullName,
    ) {}

    public static function fromRequest(
        AssistanceRequest $request,
        BeneficiaryAssistanceRole $role,
    ): self {
        $snapshot = $request->snapshot;
        $filerName = self::name([
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        ]);
        $subjectName = $role === BeneficiaryAssistanceRole::FiledForSelf
            ? $filerName
            : self::name([
                $request->on_behalf_first_name,
                $request->on_behalf_middle_name,
                $request->on_behalf_last_name,
                $request->on_behalf_suffix,
            ]);

        return new self($request, $role, $filerName, $subjectName);
    }

    /** @param array<int, mixed> $parts */
    private static function name(array $parts): string
    {
        return trim(implode(' ', array_filter($parts, static fn ($part): bool => filled($part))));
    }
}
