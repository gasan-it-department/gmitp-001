<?php

use Illuminate\Foundation\Application;
use App\Http\Middleware\RoleCheckRedirect;
use App\Http\Middleware\EnsurePhoneIsVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Admin\AdminGuardMiddleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\Client\ClientGuardMiddleware;
use App\Http\Middleware\Municipality\SetMunicipalityContext;
use App\Http\Middleware\SuperAdmin\SuperAdminGuardMiddleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);


        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,

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

    ->withExceptions(using: function (Exceptions $exceptions) {
        //
    })->create();
