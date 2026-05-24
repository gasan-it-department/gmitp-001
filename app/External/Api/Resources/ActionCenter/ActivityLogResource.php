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
 * - `by` → causer display name, falls back to "System"
 * - `description` → event name from spatie ("created", "updated", "deleted")
 * - `changes` → new values, keyed by column (post-humanize)
 * - `old` → previous values, same keys as `changes`
 * - `at` → ISO 8601 UTC timestamp
 *
 * Humanizes status enum values so the audit trail reads "Pending → Under Review"
 * instead of "pending → under_review" for COA auditors.
 *
 * Note on the data source: spatie's newer versions store the field diff in
 * the `attribute_changes` JSON column rather than `properties`. The
 * extractChanges() helper handles both shapes defensively.
 */
class ActivityLogResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request): array
    {
        $diff = $this->extractChanges();

        return [
            'id' => $this->id,
            'description' => $this->description, // 'created' | 'updated' | 'deleted'

            // FIX: Changed 'attribute_changes' to 'attributes' to match the array returned below
            'changes' => $this->humanize($diff['attributes'] ?? []),

            'old' => $this->humanize($diff['old'] ?? []),
            'by' => $this->resolveCauserName(),
            'at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Read the field diff out of whichever column this spatie version uses.
     *
     * Newer versions (v4+) store it in `attribute_changes` as a JSON string.
     * Older versions stored it inside `properties` under the `attributes`
     * and `old` keys (with `properties` being auto-cast as a Collection).
     *
     * We try `attribute_changes` first since that's the current schema, and
     * fall back to the `properties` shape so the resource keeps working if
     * the spatie version is downgraded or an older row predates the upgrade.
     *
     * @return array{attributes?: array<string, mixed>, old?: array<string, mixed>}
     */
    /**
     * Read the field diff out of whichever column this spatie version uses.
     * Handles raw JSON strings, Eloquent array casts, and Collections safely.
     *
     * @return array{attributes?: array<string, mixed>, old?: array<string, mixed>}
     */
    private function extractChanges(): array
    {
        $changes = $this->attribute_changes;

        // Path 1A: Laravel already cast it to a Collection
        if ($changes instanceof \Illuminate\Support\Collection) {
            $changes = $changes->toArray();
        }

        // Path 1B: Laravel already cast it to an Array
        if (is_array($changes)) {
            return $changes;
        }

        // Path 1C: It is still a raw JSON string from the database
        if (is_string($changes) && $changes !== '') {
            $decoded = json_decode($changes, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        // Path 2: Fallback to legacy storage inside `properties`
        $properties = $this->properties;

        if ($properties instanceof \Illuminate\Support\Collection) {
            $properties = $properties->toArray();
        }

        if (is_array($properties)) {
            return [
                'attributes' => $properties['attributes'] ?? [],
                'old' => $properties['old'] ?? [],
            ];
        }

        return [];
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
     * @param array<string, mixed> $values
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