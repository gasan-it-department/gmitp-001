<?php

namespace App\Core\Department\Dto;

use App\External\Api\Request\Department\SaveDepartmentRequest;
use Illuminate\Http\UploadedFile;

readonly class SaveDepartmentDto
{
    public function __construct(
        public string $municipalId,
        public string $name,
        public string $code,
        public ?string $description,
        public bool $isActive,
        public ?UploadedFile $logo,
    ) {
    }

    public static function fromRequest(SaveDepartmentRequest $request, string $municipalId): self
    {
        $logo = $request->file('logo');

        return new self(
            municipalId: $municipalId,
            name: $request->string('name')->toString(),
            code: $request->string('code')->upper()->toString(),
            description: $request->input('description'),
            isActive: $request->boolean('is_active', true),
            logo: $logo instanceof UploadedFile ? $logo : null,
        );
    }
}
