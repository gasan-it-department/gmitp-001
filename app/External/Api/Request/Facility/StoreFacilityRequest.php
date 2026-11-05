<?php

namespace App\External\Api\Request\Facility;

use Illuminate\Validation\Rule;
use App\Core\Facility\Enums\FacilityType;

class StoreFacilityRequest extends FacilityProfileRequest
{
    protected string $ability = 'facility.manage';

    public function rules(): array
    {
        return [...parent::rules(),
            'revision' => ['prohibited'],
            'name' => ['required', 'string', 'max:255'], 'type' => ['required', Rule::enum(FacilityType::class)],
            'description' => ['nullable', 'string', 'max:10000'], 'location_name' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2000'], 'contact_name' => ['nullable', 'string', 'max:255'],
            'address_parts' => ['sometimes', 'nullable', 'array:barangay,street'],
            'address_parts.barangay' => ['nullable', 'string', 'max:255',
                Rule::exists('psgc_barangays', 'name')->where('municipality_id', app('current_municipality')->psgc_municipal_id)->whereNull('deleted_at')],
            'address_parts.street' => ['nullable', 'string', 'max:2000'],
            'contact_phone' => ['nullable', 'string', 'max:50'], 'contact_email' => ['nullable', 'email', 'max:255'],
            'image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
            'remove_image' => ['sometimes', 'boolean'], 'is_published' => ['prohibited'], 'operating_status' => ['prohibited'],
        ];
    }
}
