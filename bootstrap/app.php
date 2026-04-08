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
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

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
