<?php

namespace App\Http\Middleware\Municipality;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Municipality\Services\MunicipalityContextService;

class SetMunicipalityContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function __construct(
        protected MunicipalityContextService $municipalityContextService,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('municipality') ?? $request->header('X-Municipality-Slug');

        if (!is_string($slug) || empty($slug)) {

            abort(404, 'Invalid url');

        }

        $municipality = $this->municipalityContextService->execute($slug);

        if (!$municipality) {

            abort(404, 'Invalid url');

        }

        $this->setContext($municipality);

        return $next($request);
    }

    public function setContext(object $municipality)
    {
        session(['municipal_id' => $municipality->id]);

        app()->instance('municipal_id', $municipality->id);

        app()->instance('current_municipality', $municipality);

        \Inertia\Inertia::share([
            'currentMunicipality' => fn() => [
                'id' => $municipality->id,
                'name' => $municipality->name,
                'slug' => $municipality->slug,
                'zip_code' => $municipality->zip_code,
            ],
        ]);
    }

    public function guardUserMunicipality()
    {
        //develop for later for admin user checking 
    }
}
