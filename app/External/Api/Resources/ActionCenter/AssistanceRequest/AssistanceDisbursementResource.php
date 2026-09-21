<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceRequest;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceDisbursementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'attempt_number' => (int) $this->attempt_number,
            'method' => $this->method?->value,
            'method_label' => $this->method?->label(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'amount' => (float) $this->amount,
            'payee_name' => $this->payee_name,
            'instrument_reference_number' => $this->instrument_reference_number,
            'instrument_date' => $this->instrument_date?->toDateString(),
            'claim_location_key' => $this->claim_location_key,
            'claim_location_label' => $this->claim_location_label,
            'claim_instructions' => $this->claim_instructions,
            'preparation_notes' => $this->preparation_notes,
            'prepared_by' => $this->whenLoaded('preparedBy', fn () => $this->shortUser($this->preparedBy)),
            'prepared_at' => $this->prepared_at?->toIso8601String(),
            'ready_by' => $this->whenLoaded('readyBy', fn () => $this->shortUser($this->readyBy)),
            'ready_at' => $this->ready_at?->toIso8601String(),
            'notification_status' => $this->notification_status,
            'notification_phone' => $this->notification_phone,
            'notification_attempts' => (int) $this->notification_attempts,
            'notification_attempted_at' => $this->notification_attempted_at?->toIso8601String(),
            'notification_sent_at' => $this->notification_sent_at?->toIso8601String(),
            'notification_failure' => $this->notification_failure,
            'manual_contacts' => data_get($this->metadata, 'manual_contacts', []),
            'released_by' => $this->whenLoaded('releasedBy', fn () => $this->shortUser($this->releasedBy)),
            'released_at' => $this->released_at?->toIso8601String(),
            'release_reference_number' => $this->release_reference_number,
            'receiver_type' => $this->receiver_type,
            'receiver_name' => $this->receiver_name,
            'receiver_relationship' => $this->receiver_relationship,
            'receiver_id_type' => $this->receiver_id_type,
            'receiver_id_last_four' => $this->receiver_id_last_four,
            'identity_checked_at' => $this->identity_checked_at?->toIso8601String(),
            'acknowledgement_signed_at' => $this->acknowledgement_signed_at?->toIso8601String(),
            'release_notes' => $this->release_notes,
            'voided_by' => $this->whenLoaded('voidedBy', fn () => $this->shortUser($this->voidedBy)),
            'voided_at' => $this->voided_at?->toIso8601String(),
            'void_reason' => $this->void_reason,
        ];
    }

    private function shortUser($user): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => (string) $user->id,
            'name' => trim(implode(' ', array_filter([$user->first_name, $user->last_name]))) ?: 'Unknown user',
        ];
    }
}
