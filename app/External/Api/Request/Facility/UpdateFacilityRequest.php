<?php

namespace App\External\Api\Request\Facility;

use Illuminate\Validation\Rule;
use App\Core\Facility\Enums\FacilityType;

class UpdateFacilityRequest extends FacilityProfileRequest
{
    protected string $ability = 'facility.manage';

    public function rules(): array
    {
        return [...parent::rules(),
            'name' => ['sometimes', 'required', 'string', 'max:255'], 'type' => ['sometimes', 'required', Rule::enum(FacilityType::class)],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'], 'location_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:2000'], 'contact_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address_parts' => ['sometimes', 'nullable', 'array:barangay,street'],
            'address_parts.barangay' => ['nullable', 'string', 'max:255',
                Rule::exists('psgc_barangays', 'name')->where('municipality_id', app('current_municipality')->psgc_municipal_id)->whereNull('deleted_at')],
            'address_parts.street' => ['nullable', 'string', 'max:2000'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:50'], 'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
            'remove_image' => ['sometimes', 'boolean'], 'is_published' => ['prohibited'], 'operating_status' => ['prohibited'],
        ];
    }
}
