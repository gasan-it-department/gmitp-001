<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Models\Decedent;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ViewDecedentAvatarController extends Controller
{
    public function __invoke(string $municipality, string $decedentId): BinaryFileResponse
    {
        $decedent = Decedent::query()->where('municipal_id', app('municipal_id'))->findOrFail($decedentId);
        $media = $decedent->getFirstMedia('avatar');
        abort_unless($media, 404);

        return response()->file($media->getPath(), [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
