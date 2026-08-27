<?php

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;

it('configures both deployed Gasan burial programs as deceased on-behalf requests', function (string $municipalCode, string $slug) {
    $definition = app(AssistanceRequestFormDefinitionProvider::class)
        ->for($municipalCode, $slug);

    expect($definition->filingMode)->toBe('on_behalf_only')
        ->and($definition->subjectType)->toBe('deceased')
        ->and($definition->requiresDateOfDeath())->toBeTrue()
        ->and($definition->toArray()['fields'])->toBe([
            [
                'key' => 'on_behalf_date_of_death',
                'label' => 'Date of Death',
                'type' => 'date',
                'required' => true,
                'admin_only' => false,
            ],
        ]);
})->with([
    'current code, regular burial' => ['1704003000', 'burial'],
    'current code, senior citizen burial' => ['1704003000', 'burial-assisstance-senior-citizen'],
    'legacy code, regular burial' => ['174003000', 'burial'],
    'legacy code, senior citizen burial' => ['174003000', 'burial-assisstance-senior-citizen'],
]);

it('keeps unconfigured assistance programs and municipalities on the normal form', function () {
    $provider = app(AssistanceRequestFormDefinitionProvider::class);

    foreach ([
        $provider->for('1704003000', 'medical'),
        $provider->for('another-municipality', 'burial'),
    ] as $definition) {
        expect($definition->filingMode)->toBe('self_or_on_behalf')
            ->and($definition->subjectType)->toBe('person')
            ->and($definition->requiresDateOfDeath())->toBeFalse()
            ->and($definition->fields)->toBe([]);
    }
});
