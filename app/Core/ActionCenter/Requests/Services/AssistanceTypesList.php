<?php

namespace App\Core\ActionCenter\Requests\Services;

use App\Core\ActionCenter\Requests\Enums\AssistanceType;

class AssistanceTypesList
{

    public function assistanceOptions(): array
    {
        $options = [];

        foreach (AssistanceType::cases() as $case) {
            $options[$case->value] = $case->assistanceLabel();
        }
        return $options;
    }

    public function assistanceOptionsV2(): array
    {
        return array_map(
            fn(AssistanceType $type) => [
                'value' => $type->value,
                'label' => $type->assistanceLabel(),
            ],
            AssistanceType::cases()
        );
    }

}