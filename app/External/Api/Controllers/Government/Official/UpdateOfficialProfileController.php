<?php

namespace App\External\Api\Controllers\Government\Official;

use App\Core\Government\Dto\OfficialDto;
use App\Core\Government\UseCase\UpdateOfficialProfileUseCase;
use App\External\Api\Request\Government\OfficialRequest;
use App\Http\Controllers\Controller;

class UpdateOfficialProfileController extends Controller
{
    public function __construct(
        private UpdateOfficialProfileUseCase $updateOfficialProfileUseCase
    ) {
    }
    public function __invoke(OfficialRequest $request, string $officialId)
    {

        $dto = OfficialDto::fromRequest($request);

        $this->updateOfficialProfileUseCase->execute($dto, $officialId);

        return back()->with('success', 'Official updated successfully.');
    }
}