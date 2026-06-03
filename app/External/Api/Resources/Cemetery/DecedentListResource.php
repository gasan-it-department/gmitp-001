<?php

namespace App\External\Api\Resources\Cemetery;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Slim row payload for the admin Decedents index table.
 */
class DecedentListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->resolveDisplayName(),
            'decedent_type' => $this->decedent_type?->value,
            'death_certificate_no' => $this->death_certificate_no ?: 'N/A',
            'date_of_death' => $this->date_of_death?->format('M d, Y') ?? 'N/A',
            'date_of_registration' => $this->date_of_registration?->format('M d, Y'),
            // Event-typed schema: interment.status is gone. An ACTIVE
            // (non-soft-deleted) currentInterment row means the decedent is
            // interred; absence means unassigned. Exhumation soft-deletes the
            // row, removing it from this scope.
            'interment_status' => $this->currentInterment ? 'interred' : 'unassigned',
            // Canonical UI identifier — "A-12-L3" via the Plot::slotLabel
            // accessor (SR-7). Falls back to null when no plot is assigned.
            'plot_label' => $this->currentInterment?->plot?->slotLabel,
        ];
    }

    private function resolveDisplayName(): string
    {
        // Memorial name wins for fetal/child without legal name.
        if (filled($this->memorial_name) && blank($this->last_name)) {
            return $this->memorial_name;
        }

        // Unknown / unidentified decedents use the reference number.
        if (blank($this->first_name) && blank($this->last_name)) {
            return $this->reference_document_number
                ? 'UNKNOWN — ' . $this->reference_document_number
                : 'UNKNOWN';
        }

        return trim(sprintf(
            '%s, %s %s %s',
            $this->last_name ?? '',
            $this->first_name ?? '',
            $this->middle_name ?? '',
            $this->suffix ?? '',
        ));
    }
}
