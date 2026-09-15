<?php

namespace App\Console\Commands;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RepairUnreleasedActionCenterCooldowns extends Command
{
    protected $signature = 'action-center:repair-unreleased-cooldowns
        {--municipality= : Municipality id, slug, or municipal code}
        {--dry-run : Explicitly run without deleting rows}
        {--apply : Delete reviewed premature cooldown rows}';

    protected $description = 'Audit or remove cooldown rows created for approved requests that were never released';

    public function handle(LockActionCenterMunicipalityAction $lockMunicipality): int
    {
        if ($this->option('apply') && $this->option('dry-run')) {
            $this->error('Choose either --apply or --dry-run, not both.');

            return self::INVALID;
        }

        $municipalId = $this->resolveMunicipalId($this->option('municipality'));
        if ($this->option('municipality') && $municipalId === null) {
            $this->error('The municipality filter did not match an existing municipality.');

            return self::FAILURE;
        }

        $query = AssistanceRequest::query()
            ->where('status', AssistanceStatus::Approved->value)
            ->whereHas('cooldowns');
        if ($municipalId !== null) {
            $query->where('municipal_id', $municipalId);
        }

        $requests = $query->withCount('cooldowns')->orderBy('id')->get();
        $repairable = $requests->filter(fn (AssistanceRequest $request): bool => ! $request->hasReleaseArtifacts());
        $contradictory = $requests->filter(fn (AssistanceRequest $request): bool => $request->hasReleaseArtifacts());

        $this->table(
            ['Request', 'Municipality', 'Cooldown rows', 'Result'],
            $requests->map(fn (AssistanceRequest $request): array => [
                $request->transaction_number ?: $request->id,
                $request->municipal_id,
                $request->cooldowns_count,
                $request->hasReleaseArtifacts() ? 'SKIP: approved with release artifacts' : 'premature cooldown',
            ])->all(),
        );

        if (! $this->option('apply')) {
            $this->info(sprintf(
                'Read-only audit: %d request(s), %d cooldown row(s) eligible for cleanup. Use --apply after review.',
                $repairable->count(),
                $repairable->sum('cooldowns_count'),
            ));

            return $contradictory->isEmpty() ? self::SUCCESS : self::FAILURE;
        }

        $deleted = 0;
        foreach ($repairable as $candidate) {
            $deleted += DB::transaction(function () use ($candidate, $lockMunicipality): int {
                $lockMunicipality->execute($candidate->municipal_id);
                $request = AssistanceRequest::query()->whereKey($candidate->id)->lockForUpdate()->firstOrFail();

                if ($request->status !== AssistanceStatus::Approved || $request->hasReleaseArtifacts()) {
                    $this->warn("Skipped {$request->transaction_number}: state changed during cleanup.");

                    return 0;
                }

                $rows = BeneficiaryCooldown::query()
                    ->where('assistance_request_id', $request->id)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();
                if ($rows->isEmpty()) {
                    return 0;
                }

                $removed = $rows->map->only([
                    'id', 'beneficiary_id', 'assistance_type_id', 'household_id',
                    'household_member_id', 'cooldown_starts_at', 'cooldown_expires_at',
                ])->all();
                BeneficiaryCooldown::query()->whereIn('id', $rows->pluck('id')->all())->delete();

                activity('assistance_request')
                    ->performedOn($request)
                    ->withProperties([
                        'event' => 'premature_cooldowns_removed',
                        'removed_cooldowns' => $removed,
                        'source' => 'action-center:repair-unreleased-cooldowns',
                    ])
                    ->log('Removed cooldowns created before physical release');

                return $rows->count();
            }, attempts: 3);
        }

        $this->info("Removed {$deleted} premature cooldown row(s). Rerunning the command is safe.");

        return $contradictory->isEmpty() ? self::SUCCESS : self::FAILURE;
    }

    private function resolveMunicipalId(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return Municipality::query()
            ->where(function ($query) use ($value): void {
                $query->whereKey($value)
                    ->orWhere('slug', $value)
                    ->orWhere('municipal_code', $value);
            })
            ->value('id');
    }
}
