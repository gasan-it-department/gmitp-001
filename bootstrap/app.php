<?php

use App\Http\Middleware\Admin\AdminGuardMiddleware;
use App\Http\Middleware\Client\ClientGuardMiddleware;
use App\Http\Middleware\EnsurePhoneIsVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Municipality\SetMunicipalityContext;
use App\Http\Middleware\RoleCheckRedirect;
use App\Http\Middleware\SuperAdmin\SuperAdminGuardMiddleware;
use App\Shared\Exceptions\Interfaces\DomainException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->trustProxies(at: '*');
        $middleware->redirectUsersTo(function (Request $request) {
            $municipality = $request->route('municipality') ?? 'default';

            return route('home', ['municipality' => $municipality]);
        });
        $middleware->redirectGuestsTo(function (Request $request) {

            if ($request->expectsJson()) {
                return null;
            }

            return route('landing');

        });

        $middleware->web(append: [
            \Illuminate\Session\Middleware\AuthenticateSession::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'phone.verified' => EnsurePhoneIsVerified::class,
            'admin' => AdminGuardMiddleware::class,
            'superAdmin' => SuperAdminGuardMiddleware::class,
            'client' => ClientGuardMiddleware::class,
            'roleCheckRedirect' => RoleCheckRedirect::class,
            'municipalityContext' => SetMunicipalityContext::class,
            'verified.phone' => EnsurePhoneIsVerified::class,
        ]);

        // Tenant context (app('municipal_id')) MUST be bound before route-model
        // binding runs, otherwise tenant-scoped resolvers like
        // AssistanceType::resolveRouteBinding() can't filter by municipality and
        // a shared slug (e.g. "medical") resolves the first match across all
        // LGUs. This replays Laravel 12's default priority list with
        // SetMunicipalityContext inserted immediately before SubstituteBindings.
        $middleware->priority([
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
            \Illuminate\Contracts\Session\Middleware\AuthenticatesSessions::class,
            SetMunicipalityContext::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Auth\Middleware\Authorize::class,
        ]);
    })

    ->withEvents(discover: [
        base_path('app/Core/*/Listeners'),
    ])


    ->withExceptions(function (Exceptions $exceptions) {

        // 1. Register the renderer for ALL DomainExceptions
        $exceptions->render(function (DomainException $e, Request $request) {

            // 2. Handle API / Axios Requests
            // if ($request->wantsJson() || !$request->hasHeader('X-Inertia')) {
    
            //     return response()->json([
            //         'error' => class_basename($e),
            //         'code' => $e->errorCode(),
            //         'message' => $e->getMessage(),
            //     ], $e->status());
            // }
            if ($request->expectsJson()) {

                return response()->json([
                    'error' => class_basename($e),
                    'code' => $e->errorCode(),
                    'message' => $e->getMessage(),
                ], $e->status());
            }
            if ($request->hasHeader('X-Inertia')) {
                return redirect()
                    ->back()
                    ->with('error', $e->getMessage());
            }
            // 3. Handle Inertia Web Requests
            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        });

    })->create();
