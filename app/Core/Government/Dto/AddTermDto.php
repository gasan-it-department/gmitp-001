<?php

namespace App\Core\Government\Dto;

use Carbon\Carbon;
use App\External\Api\Request\Government\TermRequest;

class AddTermDto
{

    public function __construct(

        public string $name,

        public string $statutoryStart,

        public string $statutoryEnd,

        public ?bool $isCurrent = false,

        public string $municipalId,

    ) {
    }

    public static function fromRequest(TermRequest $request)
    {

        $data = $request->validated();

        return new self(
            name: strtoupper($data['name']),
            statutoryStart: Carbon::parse($data['statutory_start']),
            statutoryEnd: Carbon::parse($data['statutory_end']),
            isCurrent: (bool) ($data['is_current']),
            municipalId: app('municipal_id'),
        );

    }

}