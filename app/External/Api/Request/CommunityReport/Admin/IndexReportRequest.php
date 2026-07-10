<?php

namespace App\External\Api\Request\CommunityReport\Admin;

use App\Core\CommunityReport\Dto\AdminReportFiltersDto;
use App\Core\CommunityReport\Enums\ReportCategory;
use App\Core\CommunityReport\Enums\ReportStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::enum(ReportStatus::class)],
            'category' => ['nullable', 'string', Rule::enum(ReportCategory::class)],
            'visibility' => ['nullable', 'string', Rule::in([
                AdminReportFiltersDto::VISIBILITY_ANONYMOUS,
                AdminReportFiltersDto::VISIBILITY_IDENTIFIED,
            ])],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'sort' => ['nullable', 'string', Rule::in([
                AdminReportFiltersDto::SORT_NEWEST,
                AdminReportFiltersDto::SORT_OLDEST,
            ])],
            'archive_status' => ['nullable', 'string', Rule::in([
                AdminReportFiltersDto::ARCHIVE_ACTIVE,
                AdminReportFiltersDto::ARCHIVE_ARCHIVED,
                AdminReportFiltersDto::ARCHIVE_ALL,
            ])],
            'per_page' => ['nullable', 'integer', Rule::in(AdminReportFiltersDto::PER_PAGE_OPTIONS)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'status',
            'category',
            'visibility',
            'date_from',
            'date_to',
            'sort',
            'archive_status',
            'per_page',
        ]);
    }
}
