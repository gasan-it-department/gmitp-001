<?php

namespace App\Core\Government\Dto;

use App\External\Api\Request\Government\OfficialRequest;
use Illuminate\Http\UploadedFile;

class OfficialDto
{

    public function __construct(

        public string $firstName,

        public string $lastName,

        public ?string $middleName = null,

        public ?string $suffix = null,

        public ?string $biography = null,

        public ?string $gender = null,

        public string $municipalId,

        public ?UploadedFile $profileImage,

        public string $municipalName,

    ) {
    }

    public static function fromRequest(OfficialRequest $request): self
    {

        $data = $request->validated();

        $municipality = app('current_municipality');

        return new self(
            firstName: self::sanitize($data['first_name']),
            lastName: self::sanitize($data['last_name']),
            middleName: self::sanitize($data['middle_name']),
            suffix: self::sanitize($data['suffix']),
            biography: $data['biography'],
            gender: $data['gender'],
            municipalId: app('municipal_id'),
            profileImage: $request->file('profile_image'),
            municipalName: $municipality->name,
        );

    }

    public static function sanitize($value): string
    {

        return strtoupper(trim($value ?? ''));

    }

}