<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use Normalizer;

final class HouseholdMemberIdentityMatcher
{
    /** @return array<string, array{member: ?string, beneficiary: ?string}> */
    public function mismatches(HouseholdMember $member, Beneficiary $beneficiary): array
    {
        $mismatches = [];

        $this->compareRequired($mismatches, 'first_name', $member->first_name, $beneficiary->first_name);
        $this->compareRequired($mismatches, 'last_name', $member->last_name, $beneficiary->last_name);

        $memberBirthDate = $member->birth_date?->toDateString();
        $beneficiaryBirthDate = $beneficiary->birth_date?->toDateString();
        if ($memberBirthDate === null || $beneficiaryBirthDate === null || $memberBirthDate !== $beneficiaryBirthDate) {
            $mismatches['birth_date'] = [
                'member' => $memberBirthDate,
                'beneficiary' => $beneficiaryBirthDate,
            ];
        }

        $this->compareWhenBothPresent($mismatches, 'middle_name', $member->middle_name, $beneficiary->middle_name);
        $this->compareWhenBothPresent($mismatches, 'suffix', $member->suffix, $beneficiary->suffix);

        return $mismatches;
    }

    public function assertMatches(HouseholdMember $member, Beneficiary $beneficiary): void
    {
        $mismatches = $this->mismatches($member, $beneficiary);

        if ($mismatches === []) {
            return;
        }

        throw new \DomainException(sprintf(
            'The roster row does not match the beneficiary profile (%s). Correct the records before linking or transferring.',
            collect($mismatches)
                ->map(fn (array $values, string $field): string => sprintf(
                    '%s: roster "%s", profile "%s"',
                    str_replace('_', ' ', $field),
                    $values['member'] ?? 'missing',
                    $values['beneficiary'] ?? 'missing',
                ))
                ->implode('; '),
        ));
    }

    /** @param array<string, array{member: ?string, beneficiary: ?string}> $mismatches */
    private function compareRequired(array &$mismatches, string $field, mixed $memberValue, mixed $beneficiaryValue): void
    {
        $member = $this->normalize($memberValue);
        $beneficiary = $this->normalize($beneficiaryValue);

        if ($member === null || $beneficiary === null || $member !== $beneficiary) {
            $mismatches[$field] = ['member' => $member, 'beneficiary' => $beneficiary];
        }
    }

    /** @param array<string, array{member: ?string, beneficiary: ?string}> $mismatches */
    private function compareWhenBothPresent(array &$mismatches, string $field, mixed $memberValue, mixed $beneficiaryValue): void
    {
        $member = $this->normalize($memberValue);
        $beneficiary = $this->normalize($beneficiaryValue);

        if ($member !== null && $beneficiary !== null && $member !== $beneficiary) {
            $mismatches[$field] = ['member' => $member, 'beneficiary' => $beneficiary];
        }
    }

    private function normalize(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $normalized = class_exists(Normalizer::class)
            ? (Normalizer::normalize($value, Normalizer::FORM_KC) ?: $value)
            : $value;
        $normalized = mb_strtoupper($normalized);
        $normalized = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $normalized) ?? $normalized;
        $normalized = preg_replace('/\s+/u', ' ', trim($normalized)) ?? trim($normalized);

        return $normalized === '' ? null : $normalized;
    }
}
