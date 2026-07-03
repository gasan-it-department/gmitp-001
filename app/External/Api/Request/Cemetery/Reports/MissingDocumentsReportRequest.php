<?php

namespace App\External\Api\Request\Cemetery\Reports;

use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MissingDocumentsReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'registration_status' => ['nullable', Rule::enum(RegistrationStatus::class)],
            'vital_record_type' => ['nullable', Rule::enum(VitalRecordType::class)],
            'missing_document_type' => ['nullable', Rule::enum(DecedentDocumentType::class)],
            'interment_status' => ['nullable', Rule::in(['interred', 'unassigned', 'exhumed', 'transferred_out'])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'registration_status',
            'vital_record_type',
            'missing_document_type',
            'interment_status',
            'per_page',
        ]);
    }
}
