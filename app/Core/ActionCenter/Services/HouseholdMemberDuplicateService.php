<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Dto\Household\HouseholdMemberDuplicateReviewDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\Crypt;

class HouseholdMemberDuplicateService
{
    public function __construct(private readonly HouseholdMemberIdentityMatcher $matcher) {}

    public function check(array $identity, string $householdId, string $municipalId, string $actorId): array
    {
        Household::query()->where('municipal_id', $municipalId)->findOrFail($householdId);
        $candidates = $this->candidates($identity, $municipalId);

        return [
            'candidates' => $candidates,
            'context' => Crypt::encryptString(json_encode([
                'actor' => $actorId, 'municipality' => $municipalId, 'household' => $householdId,
                'identity' => $this->identityKey($identity), 'fingerprint' => $this->fingerprint($candidates),
                'issued_at' => now()->timestamp,
            ], JSON_THROW_ON_ERROR)),
        ];
    }

    /** Recheck after the caller acquires the municipality lock. */
    public function authorize(StoreHouseholdMemberDto $dto, string $municipalId, ?string $actorId, ?HouseholdMemberDuplicateReviewDto $review): array
    {
        $identity = $this->identity($dto);
        $candidates = $this->candidates($identity, $municipalId);
        if ($candidates === [] && ! $review?->context) {
            return [];
        }
        try {
            $context = json_decode(Crypt::decryptString((string) $review?->context), true, flags: JSON_THROW_ON_ERROR);
        } catch (\Illuminate\Contracts\Encryption\DecryptException|\JsonException) {
            throw new \DomainException('Review possible existing household members before adding this person.');
        }
        if (! is_array($context)
            || ($context['actor'] ?? null) !== $actorId
            || ($context['municipality'] ?? null) !== $municipalId
            || ($context['household'] ?? null) !== $dto->householdId
            || ($context['identity'] ?? null) !== $this->identityKey($identity)
            || ! is_int($context['issued_at'] ?? null)
            || $context['issued_at'] < now()->subMinutes(30)->timestamp
            || $context['issued_at'] > now()->timestamp
            || ($context['fingerprint'] ?? null) !== $this->fingerprint($candidates)) {
            throw new \DomainException('The household match results changed or expired. Check the person again before saving.');
        }
        if ($candidates !== [] && (! $review?->differentPerson || mb_strlen(trim((string) $review->reason)) < 10 || mb_strlen(trim((string) $review->reason)) > 1000)) {
            throw new \DomainException('Confirm this is a different person and enter a 10 to 1,000 character review reason.');
        }
        if ($candidates !== [] && ! User::find($actorId)?->can('action_center.beneficiaries.manage')) {
            throw new \DomainException('An authorized household editor must review this different-person confirmation.');
        }

        return $candidates;
    }

    public function identity(StoreHouseholdMemberDto $dto): array
    {
        return ['first_name' => $dto->firstName, 'middle_name' => $dto->middleName, 'last_name' => $dto->lastName,
            'suffix' => $dto->suffix, 'birth_date' => $dto->birthDate];
    }

    public function candidates(array $identity, string $municipalId): array
    {
        $first = $this->matcher->normalizeName($identity['first_name'] ?? null);
        $last = $this->matcher->normalizeName($identity['last_name'] ?? null);
        if ($first === null || $last === null) {
            return [];
        }
        $birthDate = $identity['birth_date'] ?? null;
        $beneficiaries = Beneficiary::query()->where('municipal_id', $municipalId)->where('is_active', true)
            ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId));
        $members = HouseholdMember::query()->where('is_active', true)
            ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId));
        $results = [];
        $linked = [];
        foreach ([$beneficiaries, $members] as $query) {
            if ($birthDate) {
                $query->where(fn ($q) => $q->whereDate('birth_date', $birthDate)->orWhereNull('birth_date'));
            }
            foreach ($query->with('household.activeHead')->lazyById(200) as $record) {
                if ($this->matcher->normalizeName($record->first_name) !== $first || $this->matcher->normalizeName($record->last_name) !== $last) {
                    continue;
                }
                $isBeneficiary = $record instanceof Beneficiary;
                if (! $isBeneficiary && $record->beneficiary_id && isset($linked[$record->beneficiary_id.':'.$record->household_id])) {
                    continue;
                }
                if ($isBeneficiary) {
                    $linked[$record->id.':'.$record->household_id] = true;
                }
                $household = $record->household;
                $head = $household?->activeHead;
                $results[] = [
                    'key' => ($isBeneficiary ? 'beneficiary:' : 'member:').$record->id,
                    'full_name' => trim(implode(' ', array_filter([$record->first_name, $record->middle_name, $record->last_name, $record->suffix]))),
                    'birth_date' => $record->birth_date?->toDateString(),
                    'household_id' => $record->household_id, 'household_code' => $household?->household_code,
                    'head_name' => $head ? trim(implode(' ', array_filter([$head->first_name, $head->middle_name, $head->last_name, $head->suffix]))) : null,
                    'barangay' => $household?->barangay,
                    'membership_status' => $isBeneficiary ? 'Registered beneficiary' : 'Active household member',
                ];
            }
        }
        usort($results, fn ($a, $b) => $a['key'] <=> $b['key']);

        return $results;
    }

    private function identityKey(array $identity): array
    {
        return [
            ...array_map(fn ($field) => $this->matcher->normalizeName($identity[$field] ?? null), ['first_name', 'middle_name', 'last_name', 'suffix']),
            ($identity['birth_date'] ?? null) ?: null,
        ];
    }

    private function fingerprint(array $candidates): string
    {
        return hash('sha256', json_encode($candidates, JSON_THROW_ON_ERROR));
    }
}
