<?php

namespace App\Core\ActionCenter\Requests\Services;

use App\Core\ActionCenter\Requests\Enums\RequestStatus;



class StatusList
{
    public function statusList(): array
    {
        return array_map(fn(RequestStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], RequestStatus::cases());
    }

    // public function statusListV2()
    // {

    //     $cases = RequestStatus::cases();

    //     $status = [];

    //     foreach ($cases as $status) {
    //         [
    //             'value' => $status->value,
    //             'label' => $status->label(),
    //         ];

    //     }


    //     return $status;
    // }

}