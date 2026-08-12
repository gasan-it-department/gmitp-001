<?php

use App\Http\Middleware\SetRobotsTag;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

it('adds a noindex response header to routes protected by private middleware', function () {
    $request = Request::create('/private-page');
    $route = (new Route('GET', '/private-page', fn () => null))->middleware('auth');
    $request->setRouteResolver(fn () => $route);

    $response = (new SetRobotsTag)->handle($request, fn () => response('private'));

    expect($response->headers->get('X-Robots-Tag'))->toBe('noindex, nofollow');
});

it('does not add a noindex response header to public routes', function () {
    $request = Request::create('/public-page');
    $route = new Route('GET', '/public-page', fn () => null);
    $request->setRouteResolver(fn () => $route);

    $response = (new SetRobotsTag)->handle($request, fn () => response('public'));

    expect($response->headers->has('X-Robots-Tag'))->toBeFalse();
});
