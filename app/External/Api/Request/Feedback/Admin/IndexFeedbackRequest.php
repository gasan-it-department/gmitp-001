<?php

namespace App\External\Api\Request\Feedback\Admin;

use App\Core\Feedback\Dto\AdminFeedbackFiltersDto;
use App\Core\Feedback\Enum\FeedbackType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'department_id' => ['nullable', 'ulid', 'exists:departments,id'],
            'subject' => ['nullable', 'string', Rule::enum(FeedbackType::class)],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'visibility' => ['nullable', 'string', Rule::in([
                AdminFeedbackFiltersDto::VISIBILITY_ANONYMOUS,
                AdminFeedbackFiltersDto::VISIBILITY_IDENTIFIED,
            ])],
            'target' => ['nullable', 'string', Rule::in([
                AdminFeedbackFiltersDto::TARGET_EMPLOYEE,
                AdminFeedbackFiltersDto::TARGET_DEPARTMENT,
                AdminFeedbackFiltersDto::TARGET_UNASSIGNED,
            ])],
            'has_attachments' => ['nullable', 'string', Rule::in([
                AdminFeedbackFiltersDto::HAS_ATTACHMENTS_YES,
                AdminFeedbackFiltersDto::HAS_ATTACHMENTS_NO,
            ])],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'sort' => ['nullable', 'string', Rule::in([
                AdminFeedbackFiltersDto::SORT_NEWEST,
                AdminFeedbackFiltersDto::SORT_OLDEST,
                AdminFeedbackFiltersDto::SORT_RATING_HIGH,
                AdminFeedbackFiltersDto::SORT_RATING_LOW,
            ])],
            'per_page' => ['nullable', 'integer', Rule::in(AdminFeedbackFiltersDto::PER_PAGE_OPTIONS)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'department_id',
            'subject',
            'rating',
            'visibility',
            'target',
            'has_attachments',
            'date_from',
            'date_to',
            'sort',
            'per_page',
        ]);
    }
}
