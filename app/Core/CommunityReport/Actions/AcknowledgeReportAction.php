<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\AcknowledgeReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Users\UseCases\GetUserByIdUseCase;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\DB;

class AcknowledgeReportAction
{

    public function __construct(
        protected SmsProviderInterface $smsProvider, // 1. Inject SMS Provider here
        protected GetUserByIdUseCase $getUser,
    ) {
    }
    public function execute(AcknowledgeReportDto $dto): ReportSubmission
    {
        $report = DB::transaction(function () use ($dto) {
            $report = ReportSubmission::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($report->status !== ReportStatus::PENDING) {
                throw InvalidStateTransitionException::fromStatus(
                    $report->status->value,
                    ReportStatus::ACKNOWLEDGED->value
                );
            }

            $report->update([
                'status' => ReportStatus::ACKNOWLEDGED,
                'acknowledged_at' => now(),
                'acknowledged_by' => $dto->actorUserId,
                'acknowledgement_note' => $dto->acknowledgementNote,
            ]);

            return $report;
        }, attempts: 3);

        // Fetch user and send SMS outside the transaction to avoid blocking DB connections
        $user = $this->getUser->execute($report->user_id);

        if ($user && $user->phone) {
            $municipalityName = $report->municipal_id; // Using ID as fallback, ideally we'd have a name here
            $message = "Magandang araw! Ang inyong ulat sa Community Report ay natanggap na at kasalukuyang sinusuri ng aming tanggapan. Maraming salamat!";

            $this->smsProvider->send($user->phone, $message);
        }

        return $report;
    }
}
