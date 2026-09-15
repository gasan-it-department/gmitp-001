<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AuthorizeCooldownExceptionDto;
use App\Core\ActionCenter\UseCase\Assistance\AuthorizeCooldownExceptionAction;
use App\External\Api\Request\ActionCenter\AuthorizeCooldownExceptionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

final class AuthorizeCooldownExceptionController extends Controller
{
    public function __construct(
        private readonly AuthorizeCooldownExceptionAction $authorizeException,
    ) {}

    public function __invoke(
        AuthorizeCooldownExceptionRequest $request,
        string $assistanceRequestId,
    ): RedirectResponse {
        try {
            $this->authorizeException->execute(AuthorizeCooldownExceptionDto::fromRequest(
                $request,
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return back()->with('success', 'Cooldown exception authorized for the reviewed release context.');
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['cooldown_exception' => $exception->getMessage()]);
        }
    }
}
