<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\AssistanceRequest;

class AssistanceFilerRelationships
{
    /** @param list<array<string, mixed>> $members */
    public function filerMember(array $members, string $beneficiaryId): ?array
    {
        $matches = array_values(array_filter($members, fn (array $member): bool => ($member['beneficiary_id'] ?? null) === $beneficiaryId));

        return count($matches) === 1 ? $matches[0] : null;
    }

    /** @param list<array<string, mixed>> $members */
    public function fingerprint(array $members, string $beneficiaryId): string
    {
        $identities = array_map(fn (array $member): array => [
            (string) ($member['household_member_id'] ?? ''),
            (string) ($member['beneficiary_id'] ?? ''),
            (bool) ($member['is_household_head'] ?? false),
            (string) ($member['relationship'] ?? ''),
        ], $members);
        usort($identities, fn (array $a, array $b): int => strcmp($a[0], $b[0]));

        return hash('sha256', json_encode([$beneficiaryId, $identities], JSON_THROW_ON_ERROR));
    }

    /**
     * @param  list<array<string, mixed>>  $members
     * @param  array<string, mixed>  $answers
     * @return array<string, mixed>
     */
    public function capture(array $members, string $beneficiaryId, array $answers, ?string $actorId): array
    {
        $filer = $this->filerMember($members, $beneficiaryId);
        if ($filer === null) {
            throw new \DomainException('The filer must have exactly one linked active household row before filing or confirming relationships.');
        }

        $isHead = (bool) ($filer['is_household_head'] ?? false);
        $expected = [];
        foreach ($members as $member) {
            $id = (string) ($member['household_member_id'] ?? '');
            if ($id === '' || isset($expected[$id])) {
                throw new \DomainException('The household roster has missing or duplicate member identifiers.');
            }
            if ($id !== $filer['household_member_id']) {
                $expected[$id] = $member;
            }
        }

        if ($isHead && $answers !== []) {
            throw new \DomainException('Relationships for a household-head filer are derived from the saved roster.');
        }
        if (! $isHead && (array_diff_key($expected, $answers) !== [] || array_diff_key($answers, $expected) !== [])) {
            throw new \DomainException('Answer the relationship of every active household member to the filer. Refresh the roster if it changed.');
        }

        $relations = [];
        foreach ($expected as $id => $member) {
            $relation = $isHead ? ($member['relationship'] ?? null) : ($answers[$id] ?? null);
            if (! is_string($relation) || Relationship::tryFrom($relation) === null || $relation === Relationship::Head->value) {
                throw new \DomainException('Choose a valid relationship to the filer for every household member.');
            }
            $relations[$id] = $relation;
        }
        ksort($relations);

        return [
            'filer_beneficiary_id' => $beneficiaryId,
            'filer_household_member_id' => $filer['household_member_id'],
            'roster_fingerprint' => $this->fingerprint($members, $beneficiaryId),
            'answers' => $relations,
            'captured_at' => now()->toIso8601String(),
            'captured_by_user_id' => $actorId,
            'confirmed_at' => $isHead ? now()->toIso8601String() : null,
            'confirmed_by_user_id' => $isHead ? $actorId : null,
            'source' => $isHead ? 'head_roster' : 'filer_answers',
        ];
    }

    /** @param list<array<string, mixed>> $members */
    public function status(AssistanceRequest $request, array $members): array
    {
        $saved = data_get($request->metadata, 'filer_relationships');
        $filer = $this->filerMember($members, (string) $request->beneficiary_id);
        $isHead = (bool) ($filer['is_household_head'] ?? false);
        $answers = is_array($saved['answers'] ?? null) ? $saved['answers'] : [];
        $expectedIds = array_values(array_filter(array_map(
            fn (array $member): string => (string) ($member['household_member_id'] ?? ''),
            $members,
        ), fn (string $id): bool => $id !== '' && $id !== ($filer['household_member_id'] ?? null)));
        sort($expectedIds);
        $answerIds = array_keys($answers);
        sort($answerIds);
        $current = is_array($saved)
            && ($saved['filer_beneficiary_id'] ?? null) === (string) $request->beneficiary_id
            && hash_equals((string) ($saved['roster_fingerprint'] ?? ''), $this->fingerprint($members, (string) $request->beneficiary_id))
            && $answerIds === $expectedIds;
        $legacyHeadAnswers = [];
        if (! is_array($saved) && $isHead) {
            foreach ($members as $member) {
                $id = (string) ($member['household_member_id'] ?? '');
                if ($id !== '' && $id !== ($filer['household_member_id'] ?? null)) {
                    $legacyHeadAnswers[$id] = (string) ($member['relationship'] ?? '');
                }
            }
        }

        return [
            'answers' => $current ? $answers : $legacyHeadAnswers,
            'saved_answers' => $answers,
            'is_head_filer' => $isHead,
            'is_current' => $current,
            'is_confirmed' => $current && filled($saved['confirmed_at'] ?? null),
            'is_legacy' => ! is_array($saved),
            'roster_fingerprint' => $this->fingerprint($members, (string) $request->beneficiary_id),
            'filer_member_id' => $filer['household_member_id'] ?? null,
        ];
    }
}
