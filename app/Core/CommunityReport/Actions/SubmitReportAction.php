<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\SubmitReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\ReportLimitExceededException;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class SubmitReportAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private CheckEligibilityToReportAction $checkEligibility,
    ) {
    }

    public function execute(SubmitReportDto $dto): ReportSubmission
    {
        if (!$this->checkEligibility->execute($dto->userId, $dto->municipalId)) {
            throw ReportLimitExceededException::forDailyLimit(3);
        }

        return DB::transaction(function () use ($dto) {
            $submission = ReportSubmission::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'user_id' => $dto->userId,
                'category' => $dto->category,
                'status' => ReportStatus::PENDING,
                'location_text' => $dto->locationText,
                'latitude' => $dto->latitude,
                'longitude' => $dto->longitude,
                'description' => $dto->description,
                'is_anonymous' => $dto->isAnonymous,
            ]);

            foreach ($dto->evidencePhotos as $file) {
                if (!$file instanceof UploadedFile) {
                    continue;
                }

                $submission
                    ->addMedia($file)
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection('report_submission_evidence');
            }

            return $submission->fresh(['media']);
        }, attempts: 3);
    }
}
