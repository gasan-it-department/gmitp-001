<?php

namespace App\External\Api\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Core\Users\Dto\UpdateAdminProfileDto;
use App\Core\Users\UseCases\UpdateAdminProfileUseCase;
use App\External\Api\Request\Auth\UpdateAdminRequest;

class UpdateAdminProfileController extends Controller
{
    public function __invoke(UpdateAdminRequest $request, UpdateAdminProfileUseCase $updateAdminProfileUseCase)
    {
        $dto = UpdateAdminProfileDto::fromRequest($request);

        $updateAdminProfileUseCase->execute($dto, $request->user());

        return redirect()
            ->route('superAdmin.show.user', $dto->id)
            ->with('success', 'Administrator updated successfully');
    }
}
