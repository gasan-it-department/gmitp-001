<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssistanceTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = (string) app('municipal_id');
        $availableDocumentType = Rule::exists('ac_document_types', 'id')
            ->where(function (Builder $query) use ($municipalId): void {
                $query->where(function (Builder $ownership) use ($municipalId): void {
                    $ownership
                        ->whereNull('municipal_id')
                        ->orWhere('municipal_id', $municipalId);
                });
            });

        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],

            // 2. Standard nullable text field
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],

            'min_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:50000',
            ],

            'max_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:50000'
            ],
            'cooldown_months' => [
                'required',
                'integer',
                'min:0',
                'max:60',
            ],
            // 3. Ensure it's a strict boolean true/false from the React Switch
            'is_active' => [
                'nullable',
                'boolean'
            ],

            // 4. MUST be an array if it is provided
            'documents' => ['nullable', 'array'],

            // Validate the objects INSIDE the array
            'documents.*.id' => ['required', 'string', $availableDocumentType],
            'documents.*.is_required' => ['required', 'boolean'],
            'documents.*.physical_copy_requirement' => ['required', Rule::enum(PhysicalCopyRequirement::class)],
        ];
    }
}
