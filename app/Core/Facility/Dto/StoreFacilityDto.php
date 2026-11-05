<?php

namespace App\Core\Facility\Dto;

use Illuminate\Foundation\Http\FormRequest;

readonly class StoreFacilityDto extends FacilityProfileDto
{
    public static function fromRequest(FormRequest $request, string $municipalId): self
    {
        return new self($municipalId, $request->validated(), $request->file('image'), $request->boolean('remove_image'));
    }
}
