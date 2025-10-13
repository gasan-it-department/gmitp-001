<?php

namespace App\Core\ActionCenter\Applications\Services;

use App\Core\ActionCenter\Domains\Enums\AssistanceType;
class AssistanceTypesList
{

    public function assistanceOptionsV1(): array
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