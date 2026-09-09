<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates an ADMIN edit of an in-flight assistance request (description +
 * document scans). Sibling of {@see StoreAdminAssistanceRequest}, but:
 *
 *   • It edits an EXISTING request, so the assistance type is resolved from the
 *     stored row (the route id), not a submitted/route-bound type — the program
 *     itself is never editable here.
 *   • Every document slot is OPTIONAL (an edit only replaces what's wrong); a
 *     file, when present, is still checked for type/size.
 *
 * Identity / income / amount / status are never accepted — see the action.
 * The coarse admin gate is the route middleware group, so authorize() is true.
 */
class UpdateAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $assistanceRequest = AssistanceRequest::with('assistanceType')
            ->find($this->route('assistanceRequestId'));
        $definition = app(AssistanceRequestFormDefinitionProvider::class)->for(
            $this->municipalCode(),
            $assistanceRequest?->assistanceType?->slug,
        );

        $rules = [
            'description' => ['required', 'string', 'min:10', 'max:1000'],
            'documents' => ['nullable', 'array'],
            'on_behalf_date_of_death' => $definition->requiresDateOfDeath()
                ? ['required', 'date_format:Y-m-d', 'before_or_equal:today']
                : ['prohibited'],
        ];

        // The Core action validates document keys against the request's frozen
        // checklist. The FormRequest deliberately validates only file shape so
        // later assistance-type setting changes cannot rewrite an old case.
        $rules['documents.*'] = ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'];

        return $rules;
    }

    private function municipalCode(): ?string
    {
        return app()->bound('current_municipality')
            ? app('current_municipality')->municipal_code
            : null;
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Please explain the request / situation.',
            'description.min' => 'Please give at least a few words about the situation.',
            'on_behalf_date_of_death.required' => 'Enter the deceased person\'s date of death.',
            'on_behalf_date_of_death.date_format' => 'The Date of Death must be a valid date.',
            'on_behalf_date_of_death.prohibited' => 'Date of Death is not used by this assistance program.',
            'documents.*.mimes' => 'Allowed file types: JPG, PNG, PDF.',
            'documents.*.max' => 'Each file must be 5 MB or smaller.',
        ];
    }
}
