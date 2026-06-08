<?php

namespace App\Core\ActionCenter\UseCase\Shared;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;


class LockAssistanceRequestAction
{
    public function execute(string $id, string $municipalId, array $with = [])
    {
        $request = AssistanceRequest::query()
            ->with($with)
            ->whereKey($id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only perform actions on assistance requests from your own municipality.'
            );
        }

        return $request;
    }
}