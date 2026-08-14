<?php

use App\Core\Municipality\Models\Municipality;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('renders an empty citizen transparency page using the production schema', function () {
    $municipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Gasan',
        'slug' => 'gasan-4905',
        'municipal_code' => '4905',
        'psgc_municipal_id' => '174003000',
        'zip_code' => '4905',
        'is_active' => true,
    ]);

    $this->get(route('transparency.index', ['municipality' => $municipality->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('PublicInformation/Client/TransparencyPage')
            ->has('procurements.data', 0)
            ->where('filterOptions.categories.0.value', 'goods')
            ->where('filterOptions.statuses', fn ($statuses) => collect($statuses)
                ->pluck('value')
                ->doesntContain('draft'))
        );
});
