<?php

namespace App\Core\Feedback\Repositories;

use App\Core\Feedback\Models\Feedback;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\Models\FeedbackFiles;
use App\Core\Feedback\Dto\CreateFeedbackDto;
use App\Core\Feedback\Dto\CreateFeedbackFilesDto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FeedbackRepositories
{
    public function save(CreateFeedbackDto $dto, $feedbackId, $isAnonymous): Feedback
    {
        return Feedback::create([
            'id' => $feedbackId,
            'user_id' => $dto->userId,
            'sender_name' => $dto->senderName,
            'employee_name' => $dto->employeeName,
            'feedback_target' => $dto->feedbackTarget,
            'department_id' => $dto->departmentId,
            'rating' => $dto->rating,
            'message' => $dto->message,
            'is_anonymous' => $isAnonymous,
            'ip_address' => $dto->ipAddress,
            'user_agent' => $dto->userAgent,
            'municipal_id' => $dto->municipalId,
        ]);
    }

    public function saveFile(CreateFeedbackFilesDto $dto): FeedbackFiles
    {
        $feedbackFiles = FeedbackFiles::create(
            [
                'id' => $dto->id,
                'feedback_id' => $dto->feedbackId,
                'file_path' => $dto->cloudinaryId,
                'mime_type' => $dto->mimeType,
                'file_size' => $dto->fileSize,
                'file_url' => $dto->secureUrl,
                'original_name' => $dto->originalName,
                'file_type' => $dto->fileType,
            ]
        );
        return $feedbackFiles;
    }

    public function getAll(string $municipalId, FeedbackQueryDto $dto): LengthAwarePaginator
    {

        $sample = Feedback::where('municipal_id', $municipalId)
            ->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);
        dd(Feedback::first()->sender_name);
    }

}