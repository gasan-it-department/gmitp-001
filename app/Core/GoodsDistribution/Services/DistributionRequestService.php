<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

final class DistributionRequestService
{
    public function actor(string $municipalId, string $actorId, string $capability): User
    {
        $actor = User::findOrFail($actorId);
        if ((! $actor->hasRole(EnumRoles::SUPER_ADMIN->value) && $actor->municipal_id !== $municipalId)
            || ! $actor->can($capability) || ! $actor->can('goods_distribution.access')
            || (str_starts_with($capability, 'goods_distribution.inventory.') && ! $actor->can('goods_distribution.inventory.view'))
            || (str_starts_with($capability, 'goods_distribution.requests.') && ! $actor->can('goods_distribution.requests.view'))) {
            throw new AuthorizationException('You cannot perform this goods distribution action.');
        }

        return $actor;
    }

    public function locked(string $municipalId, string $id): DistributionRequest
    {
        return DistributionRequest::query()->where('municipal_id', $municipalId)->whereKey($id)->lockForUpdate()->firstOrFail();
    }

    public function snapshot(string $municipalId, string $beneficiaryId, ?string $subjectId): array
    {
        $filer = Beneficiary::query()->where('municipal_id', $municipalId)->whereKey($beneficiaryId)->where('is_active', true)
            ->whereNull('merged_into_beneficiary_id')->with('household.activeMembers')->firstOrFail();
        $household = $filer->household;
        abort_unless($household && $household->municipal_id === $municipalId, 404);
        $roster = $household->activeMembers->sortBy('id')->values();
        if ($roster->where('beneficiary_id', $filer->id)->count() !== 1
            || HouseholdMember::query()->where('beneficiary_id', $filer->id)->where('is_active', true)->count() !== 1) {
            throw new \DomainException('Resolve the filer household membership before filing goods.');
        }
        $subject = $subjectId ? $roster->firstWhere('id', $subjectId) : null;
        if ($subjectId && ! $subject) {
            throw new \DomainException('The assisted person must be an active member of this household.');
        }
        $person = fn ($record) => [
            'id' => $record->id, 'beneficiary_id' => $record instanceof Beneficiary ? $record->id : $record->beneficiary_id,
            'name' => trim(implode(' ', array_filter([$record->first_name, $record->middle_name, $record->last_name, $record->suffix]))),
            'birth_date' => $record->birth_date?->toDateString(), 'sex' => $record->sex,
        ];
        $members = $roster->map(fn ($member) => [...$person($member), 'relationship' => $member->relationship])->all();
        $identity = ['filer' => $person($filer), 'subject' => $subject ? $person($subject) : $person($filer),
            'household_id' => $household->id, 'roster' => $members];

        return [...$identity, 'identity_fingerprint' => hash('sha256', json_encode($identity, JSON_THROW_ON_ERROR)),
            'household_code' => $household->household_code, 'barangay' => $household->barangay, 'street' => $household->street,
            'identity_verified' => $filer->identity_verified_at !== null, 'captured_at' => now()->toIso8601String()];
    }

    public function unchangedIdentity(DistributionRequest $request): void
    {
        $live = $this->snapshot($request->municipal_id, $request->beneficiary_id, $request->assisted_household_member_id);
        if ($live['identity_fingerprint'] !== $request->reviewed_snapshot['identity_fingerprint']) {
            throw new \DomainException('Recipient or household identity changed. Return this request for correction and review it again.');
        }
    }

    public function version(DistributionRequest $request, int $version): void
    {
        if ($request->version !== $version) {
            throw new \DomainException('This goods request changed. Refresh and review the current version.');
        }
    }

    public function hash(array $data): string
    {
        return hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
    }
}
