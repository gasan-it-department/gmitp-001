<?php

namespace App\Core\ActionCenter\Requests\Dto;

use Illuminate\Http\Request;


class AssistanceQueryDto
{

    public function __construct(

        public readonly ?int $perPage = 30,

        public readonly ?string $orderBy = 'created_at',

        public readonly ?string $direction = 'desc',

        public readonly ?string $search = '',

        public readonly ?string $status = null,

        public readonly ?string $assistanceType = null,

    ) {
    }


    public static function fromRequest(Request $request, int $defaultPerPage = 30)
    {

        return new self(

            (int) $request->get('per_page', $defaultPerPage),

            $request->get('order_by', 'created_at'),

            $request->get('direction', 'desc'),

            $request->get('search'),

            $request->get('status'),

            $request->get('assistance_type'),

        );

    }
}