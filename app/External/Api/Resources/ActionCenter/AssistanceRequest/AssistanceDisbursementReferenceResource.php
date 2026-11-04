<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceRequest;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceDisbursementReferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'request_id' => $this->assistance_request_id,
            'transaction_number' => $this->whenLoaded('assistanceRequest', fn () => $this->assistanceRequest->transaction_number),
            'payee_name' => $this->payee_name,
            'amount' => $this->amount,
            'method' => $this->method->value,
            'reference' => $this->instrument_reference_number,
            'instrument_date' => $this->instrument_date?->format('Y-m-d'),
            'status' => $this->status->value,
            'blocking' => $this->status !== AssistanceDisbursementStatus::Voided,
        ];
    }
}
