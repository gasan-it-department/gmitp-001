<?php

namespace App\Core\Feedback\Dto;

use App\External\Api\Request\Feedback\SubmitFeedbackRequest;

readonly class SubmitFeedbackDto
{
    public function __construct(
        public string  $municipalId,
        public ?string $departmentId,
        public ?string $userId,
        public ?string $citizenName,
        public ?string $contactNumber,
        public ?string $email,
        public ?string $employeeName,
        public string  $subject,
        public string  $message,
        public ?int    $rating,
        public bool    $isAnonymous,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array   $attachments = [],
    ) {
    }

    public static function fromRequest(SubmitFeedbackRequest $request, string $municipalId): self
    {
        $citizenName = $request->input('citizen_name');

        return new self(
            municipalId:   $municipalId,
            departmentId:  $request->input('department_id'),
            userId:        $request->user()?->id,
            citizenName:   $citizenName,
            contactNumber: $request->input('contact_number'),
            email:         $request->input('email'),
            employeeName:  $request->input('employee_name'),
            subject:       $request->string('subject')->toString(),
            message:       $request->string('message')->toString(),
            rating:        $request->filled('rating') ? (int) $request->input('rating') : null,
            isAnonymous:   blank($citizenName),
            attachments:   $request->file('attachments', []) ?? [],
        );
    }
}
