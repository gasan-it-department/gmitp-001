<?php

namespace App\External\Api\Controllers\V1\Integration\Aga;

use App\Core\Users\Actions\DeleteAgaLinkedAccountAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteAccountController extends Controller
{
    public function __invoke(
        Request $request,
        DeleteAgaLinkedAccountAction $deleteAccount,
    ): JsonResponse {
        $validated = $request->validate([
            'supabase_user_id' => ['required', 'uuid'],
        ]);

        $deleteAccount->execute($validated['supabase_user_id']);

        return response()->json([
            'message' => 'Laravel account cleanup completed.',
        ]);
    }
}
