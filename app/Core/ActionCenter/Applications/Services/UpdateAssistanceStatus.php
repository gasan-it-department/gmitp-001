<?php

namespace App\Core\ActionCenter\Applications\Services;

use App\Core\ActionCenter\Applications\Dto\UpdateStatusDto;
class UpdateAssistanceStatus
{

    public function __construct(

    ) {
    }
    public function execute(UpdateStatusDto $dto)
    {
        dd($dto->id, $dto->newStatus, $dto->userId);
    }
}