<?php

namespace App\Core\Government\Dto;

use App\Core\Municipality\Models\Municipality;
use App\Http\Requests\AppointOfficialRequest;
use Illuminate\Http\Request;
use GuzzleHttp\Psr7\UploadedFile;

class AppointOfficialDto
{

    public function __construct(

        public string $municipalId,

        public string $termId,

        public string $positionId,

        public ?string $existingOfficialId,

        public ?string $firstName,
        public ?string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public ?string $gender,


        public string $actualStartDate,
        public ?string $politicalParty,
        public ?UploadedFile $photo,

    ) {
    }

    public function isNewOfficial(): bool
    {

        return $this->existingOfficialId === null;

    }

    public static function fromRequest(AppointOfficialRequest $request)
    {
        $data = $request->validated();

        return new self(
            municipalId: app('municipal_id'),

            termId: $data['term_id'],

            positionId: $data['position_id'],

            existingOfficialId: $data['official_id'] ?? null,

            firstName: $data['first_name'] ?? null,

            lastName: $data['last_name'] ?? null,

            middleName: $data['middle_name'] ?? null,

            suffix: $data['suffix'] ?? null,

            gender: $data['gender'] ?? null,

            actualStartDate: $data['actual_start_date'],

            politicalParty: $data['political_party'] ?? null,

            photo: $request->file('photo'),

        );


    }

}