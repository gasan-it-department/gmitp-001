<?php

namespace App\External\Api\Request\Event;

use App\Core\Event\Dto\AdminEventFiltersDto;
use App\Core\Event\Enums\EventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'schedule' => ['nullable', 'string', Rule::in([
                AdminEventFiltersDto::SCHEDULE_ONGOING,
                AdminEventFiltersDto::SCHEDULE_UPCOMING,
                AdminEventFiltersDto::SCHEDULE_PAST,
            ])],
            'publication' => ['nullable', 'string', Rule::in([
                AdminEventFiltersDto::PUBLICATION_PUBLISHED,
                AdminEventFiltersDto::PUBLICATION_DRAFT,
            ])],
            'type' => ['nullable', 'string', Rule::enum(EventType::class)],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'sort' => ['nullable', 'string', Rule::in([
                AdminEventFiltersDto::SORT_RELEVANCE,
                AdminEventFiltersDto::SORT_START_ASC,
                AdminEventFiltersDto::SORT_START_DESC,
                AdminEventFiltersDto::SORT_UPDATED_DESC,
            ])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'schedule',
            'publication',
            'type',
            'date_from',
            'date_to',
            'sort',
        ]);
    }
}
