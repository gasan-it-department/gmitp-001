<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Crypt;

class AssistanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'description' => $this->description,
            'assistance_type' => $this->assistance_type,
            'status' => $this->status,
            'amount' => $this->amount,

            'municipal_id' => $this->municipal_id,
            'user_id' => $this->user_id,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Beneficiary relationship
            'beneficiary' => $this->whenLoaded('beneficiary', function () {
                return [
                    'name' => trim(implode(' ', array_filter([
                        $this->beneficiary->first_name,
                        $this->beneficiary->middle_name,
                        $this->beneficiary->last_name,
                        $this->beneficiary->suffix,
                    ]))),

                    'id' => $this->beneficiary->id,
                    'first_name' => $this->beneficiary->first_name,
                    'middle_name' => $this->beneficiary->middle_name,
                    'last_name' => $this->beneficiary->last_name,
                    'suffix' => $this->beneficiary->suffix,

                    'contact_number' => $this->beneficiary->contact_number,
                    'email' => $this->beneficiary->email,

                    'barangay' => $this->beneficiary->barangay,
                    'municipality' => $this->beneficiary->municipality,
                    'province' => $this->beneficiary->province,
                ];
            }),

        ];
    }
}
