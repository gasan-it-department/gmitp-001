<?php

namespace App\External\Api\Resources\Facility;

use Illuminate\Http\Request;

class ClientFacilityDetailsResource extends FacilityBaseResource
{
    public function toArray(Request $request): array
    {
        return [...parent::toArray($request),
            'description' => $this->description,
            'contact_name' => $this->contact_name, 'contact_phone' => $this->contact_phone, 'contact_email' => $this->contact_email,
            'weekly_days' => $this->weeklyDays->map(fn ($day) => [
                'day_of_week' => $day->day_of_week, 'is_closed' => $day->is_closed, 'periods' => $this->periods($day->periods),
            ])->values()->all(),
            'exceptions' => $this->exceptions->map(fn ($exception) => [
                'id' => $exception->id, 'exception_date' => $exception->exception_date->toDateString(),
                'is_closed' => $exception->is_closed, 'notice_type' => $exception->notice_type->value,
                'public_notice' => $exception->public_notice, 'periods' => $this->periods($exception->periods),
            ])->values()->all(),
        ];
    }
}
