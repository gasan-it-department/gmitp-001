<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Dto\SubmitFeedbackDto;
use App\Core\Feedback\Exceptions\FeedbackLimitExceededException;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class SubmitFeedbackAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private CheckEligibilityToSendFeedbackAction $checkEligibility,
    ) {
    }

    public function execute(SubmitFeedbackDto $dto): FeedbackSubmission
    {
        if (! $this->checkEligibility->execute($dto->userId, $dto->municipalId)) {
            throw FeedbackLimitExceededException::forDailyLimit(3);
        }

        return DB::transaction(function () use ($dto) {
            $submission = FeedbackSubmission::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'department_id' => $dto->departmentId,
                'user_id' => $dto->userId,
                'citizen_name' => $dto->citizenName,
                'contact_number' => $dto->contactNumber,
                'email' => $dto->email,
                'employee_name' => $dto->employeeName,
                'subject' => $dto->subject,
                'message' => $dto->message,
                'rating' => $dto->rating,
                'is_anonymous' => $dto->isAnonymous,
            ]);

            foreach ($dto->attachments as $file) {
                if (!$file instanceof UploadedFile) {
                    continue;
                }

                $submission
                    ->addMedia($file)
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection('attachments');
            }

            return $submission->fresh(['media', 'department']);
        }, attempts: 3);
    }
}
