<?php

namespace App\Core\Facility\Dto;

use Illuminate\Foundation\Http\FormRequest;

readonly class StoreFacilityExceptionDto extends FacilityExceptionDto
{
    public static function fromRequest(FormRequest $request, string $municipalId): self
    {
        return new self($municipalId, $request->integer('revision'), $request->safe()->except(['revision', 'notify_mobile']), $request->boolean('notify_mobile'));
    }
}
