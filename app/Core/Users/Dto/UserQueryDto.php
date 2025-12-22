<?php

namespace App\Core\Users\Dto;

use Illuminate\Http\Request;

class UserQueryDto
{

    public function __construct(
        public readonly ?string $search = null,
        public readonly ?string $role = null,
        public readonly ?string $municipality = null,

    ) {
    }


    public static function fromRequest(Request $request)
    {

        return new self(
            search: $request->input('filter.search'),
            role: $request->input('filter.role'),
            municipality: $request->input('filter.municipality'),
        );

    }
}