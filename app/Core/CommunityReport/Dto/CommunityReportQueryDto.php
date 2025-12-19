<?php

namespace App\Core\CommunityReport\Dto;
use Illuminate\Http\Request;

class CommunityReportQueryDto
{
    public function __construct(
        public ?int $perPage = 10,
        public ?int $page = 1, // Add this
        public ?string $orderBy = 'created_at',
        public ?string $direction = 'desc',
    ) {
    }

    public static function fromRequest(Request $request, int $defaultPerPage = 30)
    {

        return new self(

            perPage: $request->get('per_page', $defaultPerPage),

            page: (int) $request->get('page', 1), // Capture the page number

            orderBy: $request->get('order_by', 'created_at'),

            direction: $request->get('direction', 'desc'),

        );

    }
}