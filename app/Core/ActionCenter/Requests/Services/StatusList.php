<?php

namespace App\Core\ActionCenter\Requests\Services;

use App\Core\ActionCenter\Domains\Enums\RequestStatus;

class StatusList
{
    public function statusList(): array
    {
        return array_map(fn(RequestStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], RequestStatus::cases());
    }
}