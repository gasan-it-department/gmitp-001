<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\ConfirmAssistanceFilerRelationshipsAction;
use App\External\Api\Request\ActionCenter\ConfirmAssistanceFilerRelationshipsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ConfirmAssistanceFilerRelationshipsController extends Controller
{
    public function __construct(private readonly ConfirmAssistanceFilerRelationshipsAction $confirm) {}

    public function __invoke(string $assistanceRequestId, ConfirmAssistanceFilerRelationshipsRequest $request): RedirectResponse
    {
        try {
            $actor = $request->user();
            $this->confirm->execute(
                $assistanceRequestId,
                app('municipal_id'),
                (string) $actor->id,
                $actor->can('action_center.requests.process'),
                $actor->can('action_center.requests.correct'),
                $request->string('roster_fingerprint')->toString(),
                $request->input('filer_relationships', []),
                $request->input('correction_reason'),
            );

            return back()->with('success', 'Relationships to the filer were confirmed for this request.');
        } catch (\DomainException $exception) {
            return back()->withErrors(['filer_relationships' => $exception->getMessage()]);
        }
    }
}
