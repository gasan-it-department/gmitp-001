<?php

namespace App\Http\Middleware\Municipality;

use App\Core\Municipality\Models\Municipality;
use App\External\Api\Resources\Municipality\MunicipalitySettingsResource;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Municipality\Services\MunicipalityContextService;
use Inertia\Inertia;

class SetMunicipalityContext
{
    public function __construct(
        protected MunicipalityContextService $municipalityContextService,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('municipality')
            ?? $request->header('X-Municipality-Slug')
            ?? $request->query('municipality');

        if (!is_string($slug) || empty($slug)) {

            abort(404, 'Invalid url');

        }

        $isActive = true;

        $municipality = $this->municipalityContextService->execute($slug, $isActive);

        if (!$municipality) {
            return Inertia::render('Public/RestrictedAccess/MunicipalityNoAccess')
                ->toResponse($request)
                ->setStatusCode(403);
        }

        $this->setContext($municipality);

        return $next($request);
    }

    public function setContext(Municipality $municipality)
    {
        session(['municipal_id' => $municipality->id]);

        app()->instance('municipal_id', $municipality->id);

        app()->instance('current_municipality', $municipality);

        $municipality->load(['settings', 'media']);

        Inertia::share([
            'currentMunicipality' => function () use ($municipality) {
                return [
                    'id' => $municipality->id,
                    'name' => $municipality->name,
                    'slug' => $municipality->slug,
                    'zip_code' => $municipality->zip_code,
                    'psgc_municipal_id' => $municipality->psgc_municipal_id,
                    'settings' => (new MunicipalitySettingsResource($municipality))->resolve(),
                ];
            },
        ]);
    }

    public function guardUserMunicipality()
    {



    }
}