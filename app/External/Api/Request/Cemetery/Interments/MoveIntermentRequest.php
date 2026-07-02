<?php

namespace App\External\Api\Request\Cemetery\Interments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MoveIntermentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $siteId = $this->input('destination_cemetery_site_id');

        return [
            'destination_cemetery_site_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_sites', 'id')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->where('status', 'active')
                        ->whereNull('deleted_at')),
            ],
            'destination_plot_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_plots', 'id')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->when($siteId, fn ($plotQuery) => $plotQuery->where('cemetery_site_id', $siteId))
                        ->whereNull('deleted_at')),
            ],
            'movement_date' => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'destination_cemetery_site_id.exists' => 'The selected cemetery site is not active or does not belong to this municipality.',
            'destination_plot_id.exists' => 'The selected destination plot does not belong to the selected cemetery site.',
            'movement_date.before_or_equal' => 'The movement date cannot be in the future.',
        ];
    }
}
