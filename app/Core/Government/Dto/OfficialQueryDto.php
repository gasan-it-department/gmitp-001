<?php

namespace App\Core\Government\Dto;

use Illuminate\Http\Request;

readonly class OfficialQueryDto
{

    public function __construct(
        public ?string $search = null,
        public ?bool $isCurrentlyServing = null,

        public string $sortBy = 'last_name',
        public string $sortDirection = 'asc',
        public int $perPage = 15,
    ) {
    }

    public static function fromRequest(Request $request)
    {
        $requestedPerPage = (int) $request->input('per_page', 15);
        $safePerPage = $requestedPerPage > 100 ? 100 : $requestedPerPage;

        $allowedSorts = ['first_name', 'last_name', 'created_at'];
        $sortBy = in_array($request->input('sort_by'), $allowedSorts)
            ? $request->input('sort_by')
            : 'first_name';

        $sortDirection = strtolower($request->input('sort_dir')) === 'desc' ? 'desc' : 'asc';

        return new self(
            search: strtoupper($request->input('search')),
            isCurrentlyServing: $request->has('is_currently_serving') ? $request->boolean('is_currently_serving') : null,
            sortBy: $sortBy,
            sortDirection: $sortDirection,
            perPage: $safePerPage,
        );
    }

}