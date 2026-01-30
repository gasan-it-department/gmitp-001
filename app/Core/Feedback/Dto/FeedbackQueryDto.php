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


    public static function fromRequest(Request $request, int $defaultPerPage = 30)
    {

        $allowedSorts = [
            'created_at',
            'sender_name',
            'employee_name',
            'message',
            'rating'
        ];

        $requestedSort = $request->get('order_by');

        $orderBy = in_array($requestedSort, $allowedSorts) ? $requestedSort : 'created_at';

        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';

        return new self(
            perPage: (int) $request->get('per_page', $defaultPerPage),
            orderBy: $orderBy,
            direction: $direction,
            search: $request->get('search')
        );

    }
}