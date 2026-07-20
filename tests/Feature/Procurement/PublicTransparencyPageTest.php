<?php

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('psgc_municipal_id')->nullable();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(false);
        $table->string('zip_code')->nullable();
        $table->timestamps();
    });

    Schema::create('municipality_settings', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('primary_color_hex')->nullable();
        $table->string('contact_email')->nullable();
        $table->string('trunkline_phone')->nullable();
        $table->string('office_hours')->nullable();
        $table->string('facebook_url')->nullable();
        $table->timestamps();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->string('model_id');
        $table->string('collection_name');
        $table->unsignedInteger('order_column')->nullable();
    });

    Schema::create('departments', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->timestamps();
    });

    Schema::create('procurements', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('department_id')->nullable();
        $table->string('reference_number')->nullable();
        $table->string('title');
        $table->string('category');
        $table->string('status');
        $table->decimal('abc_amount', 15, 2)->nullable();
        $table->dateTime('published_at')->nullable();
        $table->dateTime('closing_date')->nullable();
        $table->dateTime('pre_bid_date')->nullable();
        $table->string('winning_bidder_name')->nullable();
        $table->decimal('contract_amount', 15, 2)->nullable();
        $table->dateTime('awarded_date')->nullable();
        $table->text('failure_reason')->nullable();
        $table->date('failed_date')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Gasan',
        'slug' => 'gasan-4905',
        'municipal_code' => '4905',
        'psgc_municipal_id' => '174003000',
        'zip_code' => '4905',
        'is_active' => true,
    ]);
});

afterEach(function () {
    Schema::dropIfExists('procurements');
    Schema::dropIfExists('departments');
    Schema::dropIfExists('media');
    Schema::dropIfExists('municipality_settings');
    Schema::dropIfExists('municipalities');
});

it('renders without requiring admin-only procurement form data', function () {
    expect(Schema::hasTable('procurement_funding_sources'))->toBeFalse();

    $this->get(route('transparency.index', ['municipality' => 'gasan-4905']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('PublicInformation/Client/TransparencyPage')
            ->has('procurements.data', 0)
            ->where('filterOptions.categories.0.value', 'goods')
            ->where('filterOptions.statuses.0.value', 'draft')
        );
});
