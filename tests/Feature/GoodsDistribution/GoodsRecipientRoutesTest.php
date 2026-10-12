<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;

it('protects goods recipient routes with existing registry capabilities', function () {
    $routes = [
        'recipients' => 'view', 'identity-check' => 'view', 'head.create' => 'manage', 'member.create' => 'manage',
        'households.search' => 'manage', 'registration.begin' => 'manage', 'head.store' => 'manage', 'member.store' => 'manage',
    ];
    foreach ($routes as $name => $capability) {
        $route = Route::getRoutes()->getByName('goodsDistribution.'.$name);
        expect($route)->not->toBeNull();
        expect($route->gatherMiddleware())->toContain('auth', 'municipalityContext', 'admin', 'permission:action_center.access', 'permission:action_center.beneficiaries.'.$capability);
        if (str_starts_with($route->uri(), 'api/')) {
            expect($route->uri())->not->toContain('{municipality}')->and($route->methods())->toBe(['POST']);
        } else {
            expect($route->uri())->toContain('{municipality}');
        }
    }
});

it('rejects direct registration without the actual-head assertion', function () {
    $request = new \App\External\Api\Request\GoodsDistribution\StoreGoodsHouseholdHeadRequest;
    foreach ([null, false, '0'] as $value) {
        expect(Validator::make(['actual_household_head' => $value], ['actual_household_head' => $request->rules()['actual_household_head']])->fails())->toBeTrue();
    }
    expect(Validator::make(['actual_household_head' => true], ['actual_household_head' => $request->rules()['actual_household_head']])->passes())->toBeTrue();
});
