<?php

namespace App\External\Api\Request\Tourism;

use App\Core\Tourism\Enums\CategoryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTourismAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'string', 'exists:tourism_categories,id'],

            // USE THE ENUM HERE INSTEAD OF HARDCODED STRINGS!
            'type' => ['required', 'string', Rule::enum(CategoryType::class)],

            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'is_published' => ['boolean'],

            'cover' => [
                'required_if:is_published,true', // The magic gatekeeper!
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:5120'
            ],
            'gallery' => ['nullable', 'array', 'max:6'],
            'gallery.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:15360'],

            'meta' => ['nullable', 'array'],

            // --- SPECIFIC TO ESTABLISHMENTS ---
            // Notice the comma inside the string: 'required_if:type,'
            'meta.address' => ['required_if:type,' . CategoryType::ESTABLISHMENT->value, 'string', 'max:255'],
            'meta.contact_number' => ['nullable', 'string', 'max:50'],
            'meta.available_rooms' => ['nullable', 'string', 'max:100'],

            // --- SPECIFIC TO EVENTS ---
            'meta.start_date' => ['required_if:type,' . CategoryType::EVENT->value, 'date'],
            'meta.end_date' => ['required_if:type,' . CategoryType::EVENT->value, 'date', 'after_or_equal:meta.start_date'],
            'meta.organizer' => ['required_if:type,' . CategoryType::EVENT->value, 'string', 'max:255'],

            // --- SPECIFIC TO HERITAGES ---
            'meta.historical_era' => ['required_if:type,' . CategoryType::HERITAGE->value, 'string', 'max:255'],

            // --- SPECIFIC TO SPOTS ---
            'meta.entrance_fee' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'meta.start_date.required_if' => 'A start date is required for Events.',
            'meta.address.required_if' => 'An address is required for Establishments.',
        ];
    }
}