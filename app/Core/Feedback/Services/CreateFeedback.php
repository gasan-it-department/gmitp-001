<?php
namespace App\Core\Feedback\Services;

use App\Core\Feedback\Dto\CreateFeedbackDto;
use App\Core\Feedback\Models\Feedback;
use App\Shared\Contracts\IdGeneratorInterface;
use App\Core\Feedback\Repositories\FeedbackRepositories;
use App\Core\Feedback\Actions\FileUploader;
use Illuminate\Support\Facades\DB;
use App\Core\Feedback\Rules\ValidateDepartmentFeedback;
use App\Core\Feedback\Rules\ValidateEmployeeFeedback;
use Illuminate\Support\Facades\Log;

use App\Core\Feedback\Rules\ValidateFiles;

class CreateFeedback
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected FeedbackRepositories $feedbackRepositories,
        protected FileUploader $fileUploader,
        protected ValidateDepartmentFeedback $departmentvalidator,
        protected ValidateEmployeeFeedback $employeeValidator,
        protected ValidateFiles $filesValidator,
    ) {
    }

    public function execute(CreateFeedbackDto $dto): Feedback
    {
        return DB::transaction(function () use ($dto) {
            try {

                //validate the feedback data (harvey)
                $this->validateFeedback($dto);

                //validate the each files 
                $this->filesValidator->validate($dto->feedbackFiles);

                $feedbackId = $this->idGenerator->generate();
                $isAnonymous = blank($dto->senderName);

                $feedback = $this->feedbackRepositories->save($dto, $feedbackId, $isAnonymous);

                if (!empty($dto->feedbackFiles)) {
                    $this->handleFileUpload($dto->feedbackFiles, $feedbackId);
                }

                return $feedback;
            } catch (\Exception $e) {
                Log::error('Feedback creation failed', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function validateFeedback(CreateFeedbackDto $dto): void
    {
        if ($dto->feedbackTarget === 'employee') {
            $this->employeeValidator->validate($dto);
        }
        if ($dto->feedbackTarget === 'department') {
            $this->departmentvalidator->validate($dto);
        }
    }

    public function handleFileUpload(array $files, string $feedbackId): void
    {
        foreach ($files as $file) {
            $fileId = $this->idGenerator->generate();
            $this->fileUploader->upload($file, $fileId, $feedbackId);
        }
    }
}