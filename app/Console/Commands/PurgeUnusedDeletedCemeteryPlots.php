<?php

namespace App\Console\Commands;

use App\Core\Cemetery\Models\Plot;
use Illuminate\Console\Command;

class PurgeUnusedDeletedCemeteryPlots extends Command
{
    protected $signature = 'cemetery:purge-unused-deleted-plots
        {--municipal_id= : Limit cleanup to one municipality ULID}
        {--dry-run : Show how many rows would be purged without deleting them}';

    protected $description = 'Permanently purge soft-deleted cemetery plot setup rows that have no interment or lease history.';

    public function handle(): int
    {
        $municipalId = $this->option('municipal_id');
        $dryRun = (bool) $this->option('dry-run');

        $childQuery = $this->purgeableBaseQuery($municipalId)
            ->whereNotNull('parent_plot_id');

        $childCount = (clone $childQuery)->count();

        $parentCount = (clone $this->parentPurgeableAfterChildCleanupQuery($municipalId))->count();

        if ($dryRun) {
            $this->info("Purgeable soft-deleted child slot rows: {$childCount}");
            $this->info("Purgeable soft-deleted top-level plot/apartment rows after child cleanup: {$parentCount}");

            return self::SUCCESS;
        }

        (clone $childQuery)->chunkById(200, function ($plots): void {
            $plots->each->forceDeleteQuietly();
        });

        $parentQuery = $this->purgeableBaseQuery($municipalId)
            ->whereNull('parent_plot_id')
            ->whereDoesntHave('slots', fn ($query) => $query->withTrashed());
        $parentCount = (clone $parentQuery)->count();

        (clone $parentQuery)->chunkById(200, function ($plots): void {
            $plots->each->forceDeleteQuietly();
        });

        $this->info("Purged {$childCount} child slot row(s) and {$parentCount} top-level plot/apartment row(s).");

        return self::SUCCESS;
    }

    private function purgeableBaseQuery(?string $municipalId)
    {
        return Plot::onlyTrashed()
            ->when($municipalId, fn ($query) => $query->where('municipal_id', $municipalId))
            ->whereDoesntHave('interments', fn ($query) => $query->withTrashed())
            ->whereDoesntHave('leases', fn ($query) => $query->withTrashed());
    }

    private function parentPurgeableAfterChildCleanupQuery(?string $municipalId)
    {
        return $this->purgeableBaseQuery($municipalId)
            ->whereNull('parent_plot_id')
            ->whereDoesntHave('slots', fn ($query) => $query
                ->withTrashed()
                ->where(function ($slotQuery): void {
                    $slotQuery
                        ->whereNull('deleted_at')
                        ->orWhereHas('interments', fn ($intermentQuery) => $intermentQuery->withTrashed())
                        ->orWhereHas('leases', fn ($leaseQuery) => $leaseQuery->withTrashed());
                }));
    }
}
