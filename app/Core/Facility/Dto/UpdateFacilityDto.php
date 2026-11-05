<?php

namespace App\Core\Facility\Dto;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

readonly class UpdateFacilityDto extends FacilityProfileDto
{
    public function __construct(string $municipalId, array $attributes, public int $revision, ?UploadedFile $image = null, bool $removeImage = false)
    {
        parent::__construct($municipalId, $attributes, $image, $removeImage);
    }

    public static function fromRequest(FormRequest $request, string $municipalId): self
    {
        return new self($municipalId, $request->validated(), $request->integer('revision'), $request->file('image'), $request->boolean('remove_image'));
    }
}
