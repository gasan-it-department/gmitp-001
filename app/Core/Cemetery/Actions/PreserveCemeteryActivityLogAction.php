<?php

namespace App\Core\Cemetery\Actions;

use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Actions\CleanActivityLogAction;
use Spatie\Activitylog\Support\Config;

class PreserveCemeteryActivityLogAction extends CleanActivityLogAction
{
    protected function deleteOldActivities(string $cutOffDate, ?string $logName): int
    {
        if ($logName !== null && str_starts_with($logName, 'cemetery_')) {
            return 0;
        }

        $activity = Config::activityModelInstance();

        return $activity::query()
            ->where('created_at', '<', $cutOffDate)
            ->where(function (Builder $query) {
                $query->whereNull('log_name')->orWhere('log_name', 'not like', 'cemetery_%');
            })
            ->when($logName !== null, fn (Builder $query) => $query->inLog($logName))
            ->delete();
    }
}
