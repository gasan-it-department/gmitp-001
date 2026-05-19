<?php

namespace App\External\Api\Resources\ActionCenter;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

/**
 * One row of the assistance-request change history, rendered on the admin
 * detail page. Sourced from spatie/laravel-activitylog rows whose subject
 * is the assistance request being viewed.
 *
 * Shape contract with the frontend:
 *   - `by`      → causer display name, falls back to "System"
 *   - `changes` → new values, keyed by column (post-humanize)
 *   - `old`     → previous values, same keys as `changes`
 *   - `at`      → ISO 8601 UTC timestamp
 *
 * Humanizes status enum values so the audit trail reads "Pending → Under Review"
 * instead of "pending → under_review" for COA auditors.
 */
class ActivityLogResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'changes' => $this->humanize($this->properties['attributes'] ?? []),
            'old' => $this->humanize($this->properties['old'] ?? []),
            'by' => $this->resolveCauserName(),
            'at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Display name for the admin who caused this change. Uses first + last
     * so reviewers with the same first name are distinguishable in the log.
     */
    private function resolveCauserName(): string
    {
        if (!$this->causer) {
            return 'System';
        }

        $name = trim("{$this->causer->first_name} {$this->causer->last_name}");

        return $name !== '' ? $name : ($this->causer->user_name ?? 'System');
    }

    /**
     * Replace machine-readable enum values with their human labels so the
     * Change History card reads naturally. Add more keys here as new
     * enum-cast columns get included in the activity log.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function humanize(array $values): array
    {
        if (isset($values['status']) && is_string($values['status'])) {
            $values['status'] = AssistanceStatus::tryFrom($values['status'])?->label()
                ?? $values['status'];
        }

        return $values;
    }
}