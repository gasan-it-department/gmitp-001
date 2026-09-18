<?php

namespace App\Console\Commands;

use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberIdentityMatcher;
use App\Core\ActionCenter\Services\LinkedHouseholdMemberProfileSynchronizer;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Console\Command;

class AuditActionCenterHouseholdMemberships extends Command
{
    protected $signature = 'action-center:audit-household-memberships
        {--municipality= : Municipality id, slug, or municipal code}';

    protected $description = 'Report active beneficiary membership and linked-profile consistency conflicts';

    public function handle(
        HouseholdMemberIdentityMatcher $identityMatcher,
        LinkedHouseholdMemberProfileSynchronizer $profileSynchronizer,
    ): int {
        $municipalId = $this->resolveMunicipalId($this->option('municipality'));
        if ($this->option('municipality') && $municipalId === null) {
            $this->error('The municipality filter did not match an existing municipality.');

            return self::FAILURE;
        }

        $members = HouseholdMember::query()
            ->with(['household', 'beneficiary'])
            ->where('is_active', true)
            ->whereNotNull('beneficiary_id')
            ->when($municipalId, fn ($query) => $query->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId)))
            ->orderBy('beneficiary_id')
            ->orderBy('id')
            ->get();

        $duplicateLinks = $members
            ->groupBy('beneficiary_id')
            ->filter(fn ($rows): bool => $rows->count() > 1);
        $primaryMismatches = $members->filter(
            fn (HouseholdMember $member): bool => $member->beneficiary?->household_id !== $member->household_id,
        );
        $identityMismatches = $members
            ->map(fn (HouseholdMember $member): array => [
                'member' => $member,
                'fields' => $member->beneficiary
                    ? array_keys($identityMatcher->mismatches($member, $member->beneficiary))
                    : ['missing_beneficiary'],
            ])
            ->filter(fn (array $row): bool => $row['fields'] !== []);
        $profileMismatches = $members
            ->map(fn (HouseholdMember $member): array => [
                'member' => $member,
                'fields' => $member->beneficiary
                    ? array_keys($profileSynchronizer->differences($member, $member->beneficiary))
                    : ['missing_beneficiary'],
            ])
            ->filter(fn (array $row): bool => $row['fields'] !== []);

        $this->table(['Beneficiary', 'Active roster rows'], $duplicateLinks->map(
            fn ($rows, string $beneficiaryId): array => [$beneficiaryId, $rows->pluck('id')->implode(', ')],
        )->values()->all());
        $this->table(['Member', 'Beneficiary', 'Roster household', 'Primary household'], $primaryMismatches->map(
            fn (HouseholdMember $member): array => [
                $member->id,
                $member->beneficiary_id,
                $member->household_id,
                $member->beneficiary?->household_id,
            ],
        )->values()->all());
        $this->table(['Member', 'Beneficiary', 'Identity mismatches'], $identityMismatches->map(
            fn (array $row): array => [
                $row['member']->id,
                $row['member']->beneficiary_id,
                implode(', ', $row['fields']),
            ],
        )->values()->all());
        $this->table(['Member', 'Beneficiary', 'Profile mirror mismatches'], $profileMismatches->map(
            fn (array $row): array => [
                $row['member']->id,
                $row['member']->beneficiary_id,
                implode(', ', $row['fields']),
            ],
        )->values()->all());

        $issues = $duplicateLinks->count() + $primaryMismatches->count() + $profileMismatches->count();
        $this->line($issues === 0
            ? 'No active household membership conflicts found.'
            : "Found {$issues} conflict group(s)/row(s). Resolve them before running the index migration.");

        return $issues === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function resolveMunicipalId(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return Municipality::query()
            ->where(fn ($query) => $query->whereKey($value)->orWhere('slug', $value)->orWhere('municipal_code', $value))
            ->value('id');
    }
}
