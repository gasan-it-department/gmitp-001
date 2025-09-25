<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use App\Http\Middleware\Admin\AdminGuardMiddleware;
use App\Http\Middleware\SuperAdmin\SuperAdminGuardMiddleware;
use App\Http\Middleware\Client\ClientGuardMiddleware;
use App\Http\Middleware\RoleCheckRedirect;

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
            'admin' => AdminGuardMiddleware::class,
            'superAdmin' => SuperAdminGuardMiddleware::class,
            'client' => ClientGuardMiddleware::class,
            'roleCheckRedirect' => RoleCheckRedirect::class,
        ]);
    })
    ->withExceptions(using: function (Exceptions $exceptions) {
        //
    })->create();
