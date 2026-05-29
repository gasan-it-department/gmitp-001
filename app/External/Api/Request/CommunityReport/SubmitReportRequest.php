<?php

namespace App\External\Api\Request\CommunityReport;

use App\Core\CommunityReport\Enums\ReportCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category'          => ['required', 'string', Rule::enum(ReportCategory::class)],
            'location_text'     => ['required', 'string', 'max:255'],
            'latitude'          => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'         => ['nullable', 'numeric', 'between:-180,180'],
            'description'       => ['required', 'string', 'max:5000'],
            'is_anonymous'      => ['sometimes', 'boolean'],
            'evidence_photos'   => ['nullable', 'array', 'max:5'],
            'evidence_photos.*' => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required'      => 'Please choose a report category.',
            'location_text.required' => 'Please describe where the issue is located.',
            'description.required'   => 'Please describe the issue you are reporting.',
            'evidence_photos.max'    => 'You may attach up to 5 photos.',
            'evidence_photos.*.max'  => 'Each photo must be 10MB or smaller.',
        ];
    }
}
