<?php

namespace App\External\Api\Request\Feedback;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Validator;
use Throwable;

class SubmitFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'citizen_name'    => ['nullable', 'string', 'max:200'],
            'contact_number'  => ['nullable', 'string', 'max:50'],
            'email'           => ['nullable', 'email', 'max:200'],
            'employee_name'   => ['nullable', 'string', 'max:200'],
            'department_id'   => ['nullable', 'ulid', 'exists:departments,id'],
            'subject'         => ['required', 'string', 'max:255'],
            'message'         => ['required', 'string', 'max:5000'],
            'rating'          => ['nullable', 'integer', 'min:1', 'max:5'],
            'captcha_token'   => [$this->user() ? 'nullable' : 'required', 'string'],
            'attachments'     => ['nullable', 'array', 'max:5'],
            'attachments.*'   => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'subject.required'        => 'Please provide a subject for your feedback.',
            'message.required'        => 'Please write your feedback message.',
            'rating.min'              => 'Rating must be between 1 and 5.',
            'rating.max'              => 'Rating must be between 1 and 5.',
            'captcha_token.required'  => 'Please complete the CAPTCHA challenge.',
            'attachments.max'         => 'You may attach up to 5 photos.',
            'attachments.*.mimetypes' => 'Attachments must be photos in JPEG, PNG, or WebP format.',
            'attachments.*.max'       => 'Each photo must be 10MB or smaller.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->user() !== null) {
                return;
            }

            if ($validator->errors()->has('captcha_token')) {
                return;
            }

            if (! $this->captchaIsValid()) {
                $validator->errors()->add('captcha_token', 'Please complete the CAPTCHA challenge.');
            }
        });
    }

    private function captchaIsValid(): bool
    {
        $token = $this->string('captcha_token')->toString();

        if (app()->environment('testing') && $token === 'test-captcha-token') {
            return true;
        }

        $secretKey = config('services.turnstile.secret_key');

        if (blank($secretKey)) {
            return false;
        }

        try {
            return Http::asForm()
                ->timeout(5)
                ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => $secretKey,
                    'response' => $token,
                    'remoteip' => $this->ip(),
                ])
                ->json('success') === true;
        } catch (Throwable) {
            return false;
        }
    }
}
