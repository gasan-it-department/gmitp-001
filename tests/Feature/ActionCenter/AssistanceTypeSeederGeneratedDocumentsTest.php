<?php

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\Models\AssistanceType;
use Database\Seeders\AssistanceTypeSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->text('description')->nullable();
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('cooldown_months')->default(0);
        $table->string('cooldown_type')->default('per_request');
        $table->string('cooldown_scope')->default('per_beneficiary');
        $table->boolean('is_independent')->default(false);
        $table->decimal('min_amount', 10, 2)->default(0);
        $table->decimal('max_amount', 10, 2)->nullable();
        $table->unsignedInteger('sort_order')->default(0);
        $table->json('enabled_generated_documents')->nullable();
        $table->timestamps();
        $table->softDeletes();
        $table->unique(['municipal_id', 'slug']);
    });

    Schema::create('ac_document_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->nullable();
        $table->string('key')->unique();
        $table->string('label');
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_assistance_type_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_type_id');
        $table->ulid('document_type_id');
        $table->boolean('is_required')->default(true);
        $table->string('physical_copy_requirement')->default('unspecified');
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
        $table->unique(['assistance_type_id', 'document_type_id']);
    });

    $municipalId = (string) Str::ulid();
    $now = now();

    DB::table('municipalities')->insert([
        'id' => $municipalId,
        'name' => 'GASAN',
        'slug' => 'gasan-4905',
        'municipal_code' => '174003000',
        'is_active' => true,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $documentKeys = [
        'valid_id_front',
        'valid_id_back',
        'recipient_valid_id_front',
        'recipient_valid_id_back',
        'indigency_or_need_certificate',
        'medical_supporting_document',
        'med_abstract',
        'death_cert',
        'deceased_senior_citizen_id',
        'proof_of_relationship_to_deceased',
        'burial_expense_receipt',
        'funeral_contract',
        'brgy_clearance',
        'cert_enrollment',
        'report_card',
    ];

    DB::table('ac_document_types')->insert(array_map(
        fn (string $key): array => [
            'id' => (string) Str::ulid(),
            'municipal_id' => null,
            'key' => $key,
            'label' => str($key)->replace('_', ' ')->title()->toString(),
            'is_active' => true,
            'sort_order' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ],
        $documentKeys,
    ));
});

afterEach(function () {
    Schema::dropIfExists('ac_assistance_type_documents');
    Schema::dropIfExists('ac_document_types');
    Schema::dropIfExists('ac_assistance_types');
    Schema::dropIfExists('municipalities');
});

it('initializes seeded programs once without restoring an administrator selection', function () {
    $this->seed(AssistanceTypeSeeder::class);

    $assistanceTypes = AssistanceType::query()->get();

    expect($assistanceTypes)->toHaveCount(7)
        ->and($assistanceTypes->every(
            fn (AssistanceType $type): bool => $type->generatedDocumentValues() === AssistanceGeneratedDocument::values(),
        ))->toBeTrue();

    $medical = $assistanceTypes->firstWhere('slug', 'medical');
    $medical->update(['enabled_generated_documents' => []]);

    $this->seed(AssistanceTypeSeeder::class);

    expect($medical->fresh()->enabled_generated_documents)->toBe([])
        ->and($medical->fresh()->generatedDocumentValues())->toBe([]);
});
