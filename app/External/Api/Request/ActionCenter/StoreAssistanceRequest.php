<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Enum;

class StoreAssistanceRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            // --- 1. Address Anchor ---
            'barangay' => ['required', 'string', 'max:255'],
            'street_or_purok' => ['nullable', 'string', 'max:255'],

            // --- 2. Beneficiary (Actor) ---
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date', 'before:today'],
            'sex' => ['required', new Enum(Sex::class)],

            // --- 3. Request Details ---
            'contact_number' => ['required', 'string', 'max:20'],
            'assistance_type_id' => ['required', 'integer', 'exists:ac_assistance_types,id'],
            'description' => ['required', 'string', 'max:1000'],

            // --- 4. Legal ---
            'privacy_consent' => ['required', 'accepted'], // 'accepted' forces it to be true/"on"/1

            // Base array validation for documents
            'documents' => ['nullable', 'array'],
        ];

        // --- 5. The Magic: Dynamic Document Validation ---
        // We only append these rules if they successfully selected an assistance type
        $assistanceTypeId = $this->input('assistance_type_id');

        if ($assistanceTypeId) {
            // Fetch the specific rules for this assistance type from our new pivot table
            $requirements = DB::table('ac_assistance_document_requirements')
                ->join('ac_document_types', 'ac_document_types.id', '=', 'ac_assistance_document_requirements.document_type_id')
                ->where('assistance_type_id', $assistanceTypeId)
                ->get(['ac_document_types.code', 'ac_assistance_document_requirements.is_mandatory']);

            foreach ($requirements as $requirement) {
                // If the DB says it's mandatory, enforce 'required'. Otherwise, 'nullable'.
                $enforcementRule = $requirement->is_mandatory ? 'required' : 'nullable';

                // Define the exact file constraints (e.g., must be a file, max 5MB, specific types)
                $rules["documents.{$requirement->code}"] = [
                    $enforcementRule,
                    'file',
                    'mimes:jpg,jpeg,png,pdf',
                    'max:5120' // 5MB in kilobytes
                ];
            }
        }

        return $rules;
    }

}