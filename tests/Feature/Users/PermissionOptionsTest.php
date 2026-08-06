<?php

use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Services\PermissionDependencyService;
use App\Core\Users\Services\PermissionOptionService;
use App\External\Api\Request\Auth\CreateAdminRequest;
use App\External\Api\Request\Auth\UpdateAdminRequest;
use Illuminate\Support\Facades\Validator;

it('groups every enum permission under one module option', function () {
    $options = app(PermissionOptionService::class)->getPermissionOptions();

    expect($options)->toHaveKey('modules');
    expect($options['modules'])->not->toBeEmpty();

    $actualPermissionValues = collect($options['modules'])
        ->flatMap(fn (array $module) => collect($module['permissions'])->pluck('value'))
        ->values()
        ->all();

    $expectedPermissionValues = EnumPermissions::values();

    sort($actualPermissionValues);
    sort($expectedPermissionValues);

    expect($actualPermissionValues)->toBe($expectedPermissionValues);

    foreach ($options['modules'] as $module) {
        expect($module)
            ->toHaveKeys(['value', 'label', 'permissions'])
            ->and($module['permissions'])
            ->not->toBeEmpty();

        foreach ($module['permissions'] as $permission) {
            expect($permission)->toHaveKey('dependencies');
        }
    }
});

it('publishes and normalizes action center permission dependencies', function () {
    $options = app(PermissionOptionService::class)->getPermissionOptions();
    $actionCenter = collect($options['modules'])->firstWhere('value', 'action_center');
    $permissions = collect($actionCenter['permissions'])->keyBy('value');

    expect($permissions[EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value]['dependencies'])
        ->toBe([
            EnumPermissions::ACTION_CENTER_ACCESS->value,
            EnumPermissions::ACTION_CENTER_BENEFICIARIES_VIEW->value,
        ])
        ->and($permissions[EnumPermissions::ACTION_CENTER_REQUESTS_RELEASE->value]['dependencies'])
        ->toBe([
            EnumPermissions::ACTION_CENTER_ACCESS->value,
            EnumPermissions::ACTION_CENTER_REQUESTS_VIEW->value,
        ]);

    $service = app(PermissionDependencyService::class);

    expect($service->normalize([
        EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value,
    ]))->toBe([
        EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value,
        EnumPermissions::ACTION_CENTER_ACCESS->value,
        EnumPermissions::ACTION_CENTER_BENEFICIARIES_VIEW->value,
    ])->and($service->normalizeWithin(
        [EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value],
        [
            EnumPermissions::ACTION_CENTER_ACCESS->value,
            EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value,
        ],
    ))->toBe([
        EnumPermissions::ACTION_CENTER_ACCESS->value,
    ]);
});

it('rejects permission values outside the enum catalog', function (string $requestClass) {
    $request = new $requestClass;
    $rules = $request->rules();
    $permissionRules = [
        'permission' => $rules['permission'],
        'permission.*' => $rules['permission.*'],
    ];

    $valid = Validator::make(
        ['permission' => [EnumPermissions::CEMETERY_ACCESS->value]],
        $permissionRules,
    );

    $invalid = Validator::make(
        ['permission' => ['cemetery.not_real']],
        $permissionRules,
    );

    expect($valid->passes())->toBeTrue();
    expect($invalid->fails())->toBeTrue();
})->with([
    'create admin request' => [CreateAdminRequest::class],
    'update admin request' => [UpdateAdminRequest::class],
]);

it('allows update admin email to be omitted', function () {
    $request = new UpdateAdminRequest;
    $rules = ['email' => $request->rules()['email']];

    $withoutEmail = Validator::make(['email' => null], $rules);
    $withInvalidEmail = Validator::make(['email' => 'not-an-email'], $rules);

    expect($withoutEmail->passes())->toBeTrue();
    expect($withInvalidEmail->fails())->toBeTrue();
});
