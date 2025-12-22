<?php

namespace App\External\Api\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Users\Dto\CreateAdminDto;
use App\Core\Users\UseCases\CreateAdminUseCase;
use App\External\Api\Request\Auth\CreateAdminRequest;

class CreateAdminController extends Controller
{

    public function store(CreateAdminRequest $request, CreateAdminUseCase $createAdminUseCase)
    {

        $dto = CreateAdminDto::fromRequest($request);

        $createAdminUseCase->execute($dto);

        return redirect()
            ->route('superAdmin.users.page')
            ->with('success', 'Administrator created successfully');

    }

}