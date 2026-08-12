<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Symfony\Component\HttpFoundation\Response;

class SetRobotsTag
{
    private const NON_PUBLIC_MIDDLEWARE = [
        'admin',
        'auth',
        'client',
        'guest',
        'superAdmin',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldNotBeIndexed($request)) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }

    private function shouldNotBeIndexed(Request $request): bool
    {
        if ($request->is('api/*')) {
            return true;
        }

        $route = $request->route();

        if (! $route instanceof Route) {
            return false;
        }

        $middlewareNames = collect($route->gatherMiddleware())
            ->map(fn (string $middleware): string => explode(':', $middleware, 2)[0]);

        return $middlewareNames->intersect(self::NON_PUBLIC_MIDDLEWARE)->isNotEmpty();
    }
}
