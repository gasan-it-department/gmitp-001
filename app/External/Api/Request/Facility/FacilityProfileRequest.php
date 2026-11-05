<?php

namespace App\External\Api\Request\Facility;

abstract class FacilityProfileRequest extends FacilityMutationRequest
{
    protected function prepareForValidation(): void
    {
        $parts = $this->input('address_parts');
        if (! is_array($parts)) {
            return;
        }

        // Keep malformed inputs for the field rules to reject safely.
        foreach (['street', 'barangay'] as $key) {
            if (isset($parts[$key]) && ! is_string($parts[$key])) {
                return;
            }
        }

        $address = implode(', ', array_filter(array_map(
            fn ($key) => trim($parts[$key] ?? ''), ['street', 'barangay'],
        ), fn ($part) => $part !== ''));

        $this->merge(['address' => $address !== '' ? $address : null]);
    }
}
