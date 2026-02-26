<?php

namespace App\Core\Government\Dto;

use App\External\Api\Request\Government\AppointOfficialRequest;
use GuzzleHttp\Psr7\UploadedFile;
use Illuminate\Http\Request;

class AppointOfficialDto
{

    public function __construct(

        public string $municipalId,

        public string $termId,

        public string $positionId,

        public string $officialId,


        public string $actualStartDate,
        public ?string $politicalParty,
        public ?UploadedFile $photo,

    ) {
    }

    public static function fromRequest(AppointOfficialRequest $request)
    {
        $data = $request->validated();

        return new self(
            municipalId: app('municipal_id'),

            termId: $data['term_id'],

            positionId: $data['position_id'],

            officialId: $data['official_id'] ?? null,

            actualStartDate: $data['actual_start_date'],

            politicalParty: $data['political_party'] ?? null,

            photo: $request->file('photo'),

        );


    }

}