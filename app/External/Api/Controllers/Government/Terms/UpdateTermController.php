<?php

namespace App\External\Api\Controllers\Government\Terms;

use App\Core\Government\Dto\TermDto;
use App\Core\Government\UseCase\UpdateTermUseCase;
use App\External\Api\Request\Government\TermRequest;

class UpdateTermController
{

    public function __construct(

        private UpdateTermUseCase $updateTermUseCase,

    ) {
    }

    public function __invoke(string $termId, TermRequest $request)
    {

        $dto = TermDto::fromRequest($request);

        $this->updateTermUseCase->execute();

        return redirect()
            ->back()
            ->with('success', 'Term updated');
    }

}