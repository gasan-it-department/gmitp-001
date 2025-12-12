<?php

namespace App\Core\Feedback\Dto;

use Illuminate\Http\Request;

class FeedbackQueryDto
{

    public function __construct(

        public readonly int $perPage = 10,

        public readonly string $orderBy = 'created_at',

        public readonly string $direction = 'desc',

        public readonly ?string $search = null,

    ) {
    }


    public static function fromRequest(Request $request, int $defaultPerPge = 30)
    {

        return new self(

            perPage: $request->get('per_page', $defaultPerPge),

            orderBy: $request->get('order_by', 'created_at'),

            direction: $request->get('direction', 'desc'),

            search: $request->get('search')

        );

    }
}