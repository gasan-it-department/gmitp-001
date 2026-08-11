<?php

namespace App\External\Api\Request\Announcement;

use App\Core\Announcement\Dto\AdminAnnouncementFiltersDto;
use App\Core\Announcement\Enums\AnnouncementType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'publication' => ['nullable', 'string', Rule::in([
                AdminAnnouncementFiltersDto::PUBLICATION_PUBLISHED,
                AdminAnnouncementFiltersDto::PUBLICATION_DRAFT,
            ])],
            'type' => ['nullable', 'string', Rule::enum(AnnouncementType::class)],
            'sort' => ['nullable', 'string', Rule::in([
                AdminAnnouncementFiltersDto::SORT_CREATED_DESC,
                AdminAnnouncementFiltersDto::SORT_CREATED_ASC,
                AdminAnnouncementFiltersDto::SORT_UPDATED_DESC,
            ])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'publication',
            'type',
            'sort',
        ]);
    }
}
