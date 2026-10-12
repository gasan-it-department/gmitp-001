<?php

namespace App\External\Api\Request\GoodsDistribution;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\GoodsDistribution\Enums\DocumentEvidenceMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveProgramDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods_distribution.inventory.manage');
    }

    public function rules(): array
    {
        return [
            'requirements_fingerprint' => ['required', 'string', 'size:64'], 'requirements' => ['present', 'array', 'max:50'],
            'requirements.*' => ['array:document_type_id,is_required,evidence_mode,physical_copy_requirement'],
            'requirements.*.document_type_id' => ['required', 'ulid', 'distinct'],
            'requirements.*.is_required' => ['required', 'boolean'],
            'requirements.*.evidence_mode' => ['required', Rule::enum(DocumentEvidenceMode::class)],
            'requirements.*.physical_copy_requirement' => ['required', Rule::enum(PhysicalCopyRequirement::class)],
        ];
    }
}
