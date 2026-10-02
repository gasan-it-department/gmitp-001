<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Exceptions\RegistrationIdentityCheckException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberIdentityMatcher;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

final class CheckBeneficiaryRegistrationIdentityAction
{
    public function __construct(private readonly HouseholdMemberIdentityMatcher $matcher) {}

    /** @return array{candidates: array<int, array<string, mixed>>, context: string} */
    public function execute(array $identity, string $municipalId, string $actorId, ?string $selectedMemberId = null, ?string $householdId = null): array
    {
        $candidates = $this->candidates($identity, $municipalId, $selectedMemberId, $householdId);

        return [
            'candidates' => $candidates,
            'context' => Crypt::encryptString(json_encode([
                'municipal_id' => $municipalId,
                'actor_id' => $actorId,
                'identity' => $this->identityKey($identity),
                'candidate_keys' => $this->candidateKeys($candidates),
                'selected_member_id' => $selectedMemberId,
                'household_id' => $householdId,
                'issued_at' => now()->timestamp,
            ], JSON_THROW_ON_ERROR)),
        ];
    }

    /**
     * Must be called after acquiring the municipality transaction lock.
     *
     * @return array<int, array<string, mixed>>
     */
    public function authorizeCreation(
        array $identity,
        string $municipalId,
        string $actorId,
        string $context,
        ?string $reason,
        ?string $selectedMemberId = null,
        ?string $householdId = null,
    ): array {
        try {
            $review = json_decode(Crypt::decryptString($context), true, flags: JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException $exception) {
            throw new RegistrationIdentityCheckException('The registry check is invalid. Check the person again.', previous: $exception);
        }

        if (! is_array($review)
            || ($review['municipal_id'] ?? null) !== $municipalId
            || ($review['actor_id'] ?? null) !== $actorId
            || ($review['identity'] ?? null) !== $this->identityKey($identity)
            || ($review['selected_member_id'] ?? null) !== $selectedMemberId
            || ($review['household_id'] ?? null) !== $householdId
            || ! is_int($review['issued_at'] ?? null)
            || $review['issued_at'] < now()->subMinutes(30)->timestamp
            || $review['issued_at'] > now()->timestamp
            || ! is_array($review['candidate_keys'] ?? null)) {
            throw new RegistrationIdentityCheckException('The registry check expired or identity changed. Check the person again.');
        }

        $candidates = $this->candidates($identity, $municipalId, $selectedMemberId, $householdId);
        if ($review['candidate_keys'] !== $this->candidateKeys($candidates)) {
            throw new RegistrationIdentityCheckException('Registry results changed. Check the person again before saving.');
        }

        if ($candidates !== []) {
            $reason = trim((string) $reason);
            if (mb_strlen($reason) < 10 || mb_strlen($reason) > 1000) {
                throw new RegistrationIdentityCheckException('Enter a 10 to 1,000 character reason for registering a different person.');
            }

            $actor = User::query()->find($actorId);
            if (! $actor?->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_CORRECT->value)) {
                throw new RegistrationIdentityCheckException('A reviewer with beneficiary correction permission must authorize a different-person registration.');
            }
        }

        return $candidates;
    }

    /** @return array<int, array<string, mixed>> */
    private function candidates(array $identity, string $municipalId, ?string $selectedMemberId, ?string $householdId): array
    {
        $first = $this->matcher->normalizeName($identity['first_name'] ?? null);
        $last = $this->matcher->normalizeName($identity['last_name'] ?? null);
        $birthDate = (string) ($identity['birth_date'] ?? '');
        if ($first === null || $last === null || $birthDate === '') {
            throw new RegistrationIdentityCheckException('Enter a first name, last name, and birth date before checking the registry.');
        }

        $applicant = new Beneficiary([
            'first_name' => $identity['first_name'],
            'last_name' => $identity['last_name'],
            'middle_name' => $identity['middle_name'] ?? null,
            'suffix' => $identity['suffix'] ?? null,
            'birth_date' => $birthDate,
        ]);

        if ($selectedMemberId !== null) {
            $selected = HouseholdMember::query()
                ->whereKey($selectedMemberId)
                ->where('household_id', $householdId)
                ->whereHas('household', fn ($query) => $query->where('municipal_id', $municipalId))
                ->where('is_active', true)
                ->whereNull('beneficiary_id')
                ->where('relationship', '!=', 'head')
                ->first();
            if (! $selected || $this->matcher->mismatches($selected, $applicant) !== []) {
                throw new RegistrationIdentityCheckException('The selected household member no longer matches. Review the roster before registering.');
            }
        }

        $results = [];
        $beneficiaries = Beneficiary::query()
            ->where('municipal_id', $municipalId)
            ->whereHas('household', fn ($query) => $query->where('municipal_id', $municipalId))
            ->cursor();

        foreach ($beneficiaries as $beneficiary) {
            $match = $this->matchType($identity, $beneficiary);
            if ($match === null) {
                continue;
            }
            $beneficiary->loadMissing('household');
            $results[] = [
                'key' => 'beneficiary:'.$beneficiary->id,
                'record_type' => 'beneficiary',
                'match_type' => $match,
                'id' => $beneficiary->merged_into_beneficiary_id ?: $beneficiary->id,
                'beneficiary_number' => $beneficiary->beneficiary_number,
                'full_name' => trim($beneficiary->full_name),
                'birth_date' => $beneficiary->birth_date?->toDateString(),
                'household_id' => $beneficiary->household_id,
                'household_code' => $beneficiary->household?->household_code,
                'barangay' => $beneficiary->household?->barangay,
                'relationship' => null,
                'can_reuse' => false,
            ];
        }

        $members = HouseholdMember::query()
            ->whereHas('household', fn ($query) => $query->where('municipal_id', $municipalId))
            ->where('is_active', true)
            ->whereNull('beneficiary_id')
            ->cursor();

        foreach ($members as $member) {
            if ($member->id === $selectedMemberId) {
                continue;
            }
            $match = $this->matchType($identity, $member);
            if ($match === null) {
                continue;
            }
            $member->loadMissing('household');
            $results[] = [
                'key' => 'member:'.$member->id,
                'record_type' => 'roster_only',
                'match_type' => $match,
                'id' => $member->id,
                'beneficiary_number' => null,
                'full_name' => trim("{$member->first_name} {$member->middle_name} {$member->last_name} {$member->suffix}"),
                'birth_date' => $member->birth_date?->toDateString(),
                'household_id' => $member->household_id,
                'household_code' => $member->household?->household_code,
                'barangay' => $member->household?->barangay,
                'relationship' => $member->relationship,
                'can_reuse' => $member->relationship !== 'head' && $this->matcher->mismatches($member, $applicant) === [],
            ];
        }

        usort($results, fn (array $a, array $b): int => [$a['match_type'] !== 'exact', $a['full_name'], $a['key']]
            <=> [$b['match_type'] !== 'exact', $b['full_name'], $b['key']]);

        if (count($results) > 50) {
            throw new RegistrationIdentityCheckException('Too many possible records matched. Use Search People to review the person before registration.');
        }

        return $results;
    }

    private function matchType(array $identity, Beneficiary|HouseholdMember $record): ?string
    {
        $firstMatches = $this->matcher->normalizeName($identity['first_name']) === $this->matcher->normalizeName($record->first_name);
        $lastMatches = $this->matcher->normalizeName($identity['last_name']) === $this->matcher->normalizeName($record->last_name);
        $dateMatches = $record->birth_date?->toDateString() === $identity['birth_date'];

        if ($firstMatches && $lastMatches && $dateMatches) {
            return 'exact';
        }

        return ($firstMatches && $lastMatches) || ($dateMatches && ($firstMatches || $lastMatches))
            ? 'possible'
            : null;
    }

    private function identityKey(array $identity): array
    {
        return [
            'first_name' => $this->matcher->normalizeName($identity['first_name'] ?? null),
            'last_name' => $this->matcher->normalizeName($identity['last_name'] ?? null),
            'middle_name' => $this->matcher->normalizeName($identity['middle_name'] ?? null),
            'suffix' => $this->matcher->normalizeName($identity['suffix'] ?? null),
            'birth_date' => $identity['birth_date'] ?? null,
        ];
    }

    private function candidateKeys(array $candidates): array
    {
        $keys = array_column($candidates, 'key');
        sort($keys);

        return $keys;
    }
}
