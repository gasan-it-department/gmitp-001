<?php

namespace App\Core\Facility\Dto;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

abstract readonly class FacilityProfileDto
{
    public const PROFILE_FIELDS = ['name', 'type', 'description', 'location_name', 'address', 'contact_name', 'contact_phone', 'contact_email'];

    public array $attributes;

    public function __construct(
        public string $municipalId,
        array $attributes,
        public ?UploadedFile $image = null,
        public bool $removeImage = false,
    ) {
        $this->attributes = Arr::only($attributes, self::PROFILE_FIELDS);
    }
}
