<?php

namespace App\Core\Feedback\Dto;

use Illuminate\Http\Request;

readonly class FeedbackQueryDto
{
    public function __construct(
        public int $perPage = 10,
        public string $orderBy = 'created_at',
        public string $direction = 'desc',
        public ?string $search = null,
    ) {
    }

    public static function fromRequest(Request $request, int $defaultPerPage = 10): self
    {
        $allowedSorts = ['created_at', 'subject', 'rating'];

        $requestedSort = $request->get('order_by');
        $orderBy = in_array($requestedSort, $allowedSorts, true) ? $requestedSort : 'created_at';
        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';

        return new self(
            perPage: (int) $request->get('per_page', $defaultPerPage),
            orderBy: $orderBy,
            direction: $direction,
            search: $request->get('search'),
        );
    }
}
