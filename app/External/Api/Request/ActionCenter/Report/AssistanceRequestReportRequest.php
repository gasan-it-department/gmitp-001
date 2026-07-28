<?php

namespace App\External\Api\Request\ActionCenter\Report;

use App\Core\ActionCenter\Dto\Report\AssistanceRequestReportFiltersDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssistanceRequestReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = (string) app('municipal_id');

        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(AssistanceStatus::class)],
            'assistance_type_id' => [
                'nullable',
                'ulid',
                Rule::exists('ac_assistance_types', 'id')
                    ->where(fn (Builder $query) => $query->where('municipal_id', $municipalId)),
            ],
            'barangay' => ['nullable', 'string', 'max:150'],
            'source' => ['nullable', Rule::in([
                AssistanceRequestReportFiltersDto::SOURCE_PORTAL,
                AssistanceRequestReportFiltersDto::SOURCE_WALK_IN,
            ])],
            'date_basis' => ['nullable', Rule::in([
                AssistanceRequestReportFiltersDto::DATE_SUBMITTED,
                AssistanceRequestReportFiltersDto::DATE_RELEASED,
            ])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'status',
            'assistance_type_id',
            'barangay',
            'source',
            'date_basis',
            'date_from',
            'date_to',
            'per_page',
        ]);
    }
}
