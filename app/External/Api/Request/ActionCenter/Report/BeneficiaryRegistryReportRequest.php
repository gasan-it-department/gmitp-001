<?php

namespace App\External\Api\Request\ActionCenter\Report;

use App\Core\ActionCenter\Dto\Report\BeneficiaryRegistryReportFiltersDto;
use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BeneficiaryRegistryReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'barangay' => ['nullable', 'string', 'max:150'],
            'sex' => ['nullable', Rule::enum(Sex::class)],
            'verification' => ['nullable', Rule::in(['pending', 'verified', 'rejected'])],
            'source' => ['nullable', Rule::in([
                BeneficiaryRegistryReportFiltersDto::SOURCE_PORTAL,
                BeneficiaryRegistryReportFiltersDto::SOURCE_WALK_IN,
            ])],
            'lifecycle' => ['nullable', Rule::in([
                BeneficiaryRegistryReportFiltersDto::LIFECYCLE_CURRENT,
                BeneficiaryRegistryReportFiltersDto::LIFECYCLE_INACTIVE,
                BeneficiaryRegistryReportFiltersDto::LIFECYCLE_MERGED,
                BeneficiaryRegistryReportFiltersDto::LIFECYCLE_ALL,
            ])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'barangay',
            'sex',
            'verification',
            'source',
            'lifecycle',
            'per_page',
        ]);
    }
}
