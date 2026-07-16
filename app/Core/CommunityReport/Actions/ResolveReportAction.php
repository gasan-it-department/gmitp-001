<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\ResolveReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Users\UseCases\GetUserByIdUseCase;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\DB;

class ResolveReportAction
{
    public function __construct(
        protected SmsProviderInterface $smsProvider,
        protected GetUserByIdUseCase $getUser,
    ) {
    }

    public function execute(ResolveReportDto $dto): ReportSubmission
    {
        $report = DB::transaction(function () use ($dto) {
            $report = ReportSubmission::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($report->status !== ReportStatus::IN_PROGRESS) {
                throw InvalidStateTransitionException::fromStatus(
                    $report->status->value,
                    ReportStatus::RESOLVED->value
                );
            }

            $report->update([
                'status' => ReportStatus::RESOLVED,
                'resolved_at' => now(),
                'resolved_by' => $dto->actorUserId,
                'resolution_note' => $dto->resolutionNote,
            ]);

            return $report;
        }, attempts: 3);

        // Fetch user and send SMS outside the transaction to avoid blocking DB connections
        $user = $this->getUser->execute($report->user_id);

        if ($user && $user->phone) {
            $message = "Magandang araw! Ang inyong ulat sa Community Report ay matagumpay nang naresolba. Maraming salamat sa inyong kooperasyon!";

            $this->smsProvider->send($user->phone, $message);
        }

        return $report;
    }
}
