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

    public function getByUserId(string $userId, string $municipalId, FeedbackQueryDto $dto)
    {

        $query = Feedback::query()
            ->with('attachments')
            ->where('user_id', $userId)
            ->where('municipal_id', $municipalId);

        if ($dto->search) {

            $query->where(function ($q) use ($dto) {
                $q->where('sender_name', 'like', "%{$dto->search}%")
                    ->orWhere('employee_name', 'like', "%{$dto->search}%")
                    ->orWhere('message', 'like', "%{$dto->search}%");

            });

        }

        $query->orderBy($dto->orderBy, $dto->direction);

        return $query->paginate($dto->perPage);
    }

    public function saveFile(array $fileData, string $fileId, string $feedbackId): FeedbackFiles
    {

        $feedbackFiles = FeedbackFiles::create(
            [

                'id' => $fileId,

                'feedback_id' => $feedbackId,

                'mime_type' => $fileData['mime_type'],

                'file_size' => $fileData['file_size'],

                'public_id' => $fileData['public_id'],

                'original_name' => $fileData['original_name'],

            ]
        );
        return $feedbackFiles;
    }

    public function getAll(string $municipalId, FeedbackQueryDto $dto): LengthAwarePaginator
    {
        $query = Feedback::query()
            ->where('municipal_id', $municipalId)
            ->with('attachments');

        $feedback = Feedback::with('attachments')
            ->where('municipal_id', $municipalId)
            ->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);

        return $feedback;
    }

    public function findByIdAndMunicipality(string $municipalId, string $feedbackId)
    {

        return Feedback::with('attachments')
            ->where('municipal_id', $municipalId)
            ->findOrFail($feedbackId);

    }



}