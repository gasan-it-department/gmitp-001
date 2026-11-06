<?php

namespace App\Core\Facility\Services;

use App\Core\Facility\Dto\FacilityOperatingStatusDto;
use App\Core\Facility\Models\Facility;
use App\Shared\Aga\Dto\AgaNotificationDto;
use App\Shared\Aga\Jobs\SendAgaNotificationJob;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class FacilityNotificationService
{
    public function options(): array
    {
        $settings = config('services.aga_notifications', []);
        $url = $settings['url'] ?? '';

        return [
            'available' => (bool) ($settings['enabled'] ?? false)
                && is_string($url) && filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https'
                && is_string($settings['secret'] ?? null) && trim($settings['secret']) !== ''
                && in_array($settings['schema'] ?? 'test', ['test', 'app_main_schema'], true),
            'schema' => ($settings['schema'] ?? 'test') === 'app_main_schema' ? 'app_main_schema' : 'test',
        ];
    }

    public function scheduleChanged(array $before, array $after): bool
    {
        return $this->scheduleSnapshot($before) !== $this->scheduleSnapshot($after);
    }

    private function scheduleSnapshot(array $data): array
    {
        if ($data === []) {
            return [];
        }
        $periods = array_map(fn ($period) => [(int) $period['opening_minute'], (int) $period['closing_minute']], $data['periods'] ?? []);
        sort($periods);

        return [CarbonImmutable::parse($data['exception_date'])->toDateString(), (bool) $data['is_closed'],
            $data['notice_type'], trim($data['public_notice']), $periods];
    }

    public function schedule(Facility $facility, bool $requested, bool $changed, array $data): void
    {
        $labels = ['cancelled' => 'Cancelled', 'closed' => 'Closed', 'special_hours' => 'Special hours', 'delayed' => 'Delayed opening'];
        $end = $data['end_date'] ?? $data['exception_date'];
        $dates = $end === $data['exception_date'] ? 'Date: '.$data['exception_date'] : 'Dates: '.$data['exception_date'].' to '.$end;
        $message = $dates.'. '.trim($data['public_notice']);
        if (! $data['is_closed']) {
            $message .= ' Hours: '.$this->periods($data['periods']).' (Philippine time).';
        }
        $this->queue($facility, $requested, $changed, $labels[$data['notice_type']], $message);
    }

    public function operatingStatus(Facility $facility, bool $changed, FacilityOperatingStatusDto $dto): void
    {
        $resuming = $dto->status->value === 'following_schedule';
        $message = $resuming
            ? 'The operating hold has been cleared. Check the latest facility hours before visiting.'
            : trim($dto->notice ?? '');
        if ($resuming && $dto->todayException) {
            $message .= ' Revised hours today: '.$this->periods($dto->todayException['periods']).' (Philippine time). '.trim($dto->todayException['public_notice']);
        } elseif ($facility->expected_reopens_at) {
            $message .= ' Expected reopening: '.$facility->expected_reopens_at->setTimezone('Asia/Manila')->format('Y-m-d H:i').' (Philippine time; estimate only).';
        }
        $this->queue($facility, $dto->notifyMobile, $changed, $resuming ? 'Schedule resumed' : $dto->status->label(), $message);
    }

    private function periods(array $periods): string
    {
        usort($periods, fn ($a, $b) => $a['opening_minute'] <=> $b['opening_minute']);
        $time = fn ($minute) => sprintf('%02d:%02d', intdiv($minute, 60), $minute % 60);

        return implode(', ', array_map(fn ($period) => $time($period['opening_minute']).'-'.$time($period['closing_minute']), $periods));
    }

    private function queue(Facility $facility, bool $requested, bool $changed, string $label, string $message): void
    {
        if (! $requested) {
            return;
        }
        if (! $facility->is_published) {
            $facility->notificationOutcome = 'unpublished';

            return;
        }
        if (! $changed) {
            $facility->notificationOutcome = 'unchanged';

            return;
        }
        $options = $this->options();
        if (! $options['available']) {
            $facility->notificationOutcome = 'unavailable';

            return;
        }

        $town = $facility->municipality()->value('name');
        $notification = new AgaNotificationDto(
            eventType: config('services.aga_notifications.facility_event_type'),
            title: $town.' - '.$facility->name.': '.$label,
            message: $message,
            audience: 'all',
            schema: $options['schema'],
        );
        DB::afterCommit(function () use ($notification, $facility) {
            try {
                Bus::dispatch(new SendAgaNotificationJob($notification));
                $facility->notificationOutcome = $notification->schema === 'test' ? 'queued_test' : 'queued';
            } catch (Throwable) {
                // Do not undo a committed update or log the payload, credentials or transport exception.
                $facility->notificationOutcome = 'queue_failed';
                Log::warning('Facility notification could not be queued or delivered.', ['facility_id' => $facility->id]);
            }
        });
    }

    public function feedback(Facility $facility, string $saved): string
    {
        return $saved.match ($facility->notificationOutcome) {
            'queued' => ' Notification queued for AGA Mobile users.',
            'queued_test' => ' Test notification queued for AGA Mobile test devices.',
            'unpublished' => ' No notification sent: the facility is unpublished.',
            'unchanged' => ' No notification sent: public information is unchanged.',
            'unavailable' => ' Notification not queued: mobile delivery is unavailable.',
            'queue_failed' => ' Notification delivery could not be started. The update was saved; review before retrying.',
            default => '',
        };
    }
}
