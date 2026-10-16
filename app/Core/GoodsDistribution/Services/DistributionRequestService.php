<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Enums\DistributionStatus;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

final class DistributionRequestService
{
    public function __construct(private readonly StockQuantityService $quantities) {}

    public function editingCapability(DistributionRequest $request, string $actorId): string
    {
        return $request->status === DistributionStatus::UnderReview
            || ($request->status === DistributionStatus::Draft && ! User::findOrFail($actorId)->can('goods_distribution.requests.intake'))
            ? 'process' : 'intake';
    }

    public function assertReady(DistributionRequest $request, bool $checkIdentity = true): void
    {
        if ($checkIdentity) {
            $this->unchangedIdentity($request);
        }
        Program::query()->where('municipal_id', $request->municipal_id)->whereKey($request->program_id)->where('is_active', true)->firstOrFail();
        StorageLocation::query()->where('municipal_id', $request->municipal_id)->whereKey($request->storage_location_id)->where('is_active', true)->firstOrFail();
        $request->load('lines');
        if ($request->lines->isEmpty()) {
            throw new \DomainException('Add at least one item and complete its quantity before submitting for review.');
        }
        foreach ($request->lines as $line) {
            if ($line->quantity === null) {
                throw new \DomainException('Complete every item quantity before submitting for review.');
            }
            if ($this->quantities->parse((string) $line->quantity, $line->base_unit) < 1) {
                throw new \DomainException('Request quantities must be positive.');
            }
            $item = Item::query()->where('municipal_id', $request->municipal_id)->whereKey($line->item_id)->where('is_active', true)->first();
            if (! $item
                || ! ProgramItem::query()->where('municipal_id', $request->municipal_id)->where('program_id', $request->program_id)
                    ->where('item_id', $line->item_id)->where('is_active', true)->exists()) {
                throw new \DomainException('A requested item is no longer enabled.');
            }
            if ($item->base_unit !== $line->base_unit) {
                throw new \DomainException('A requested item unit changed. Edit its goods details before submitting for review.');
            }
        }
    }

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
