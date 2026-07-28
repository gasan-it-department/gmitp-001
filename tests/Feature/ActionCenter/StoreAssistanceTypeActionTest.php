<?php

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceTypeDto;
use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceTypeDto;
use App\Core\ActionCenter\Exceptions\AssistanceTypeException;
use App\Core\ActionCenter\UseCase\Assistance\GetActiveDocumentTypesForDropdown;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceTypeAction;
use App\Core\ActionCenter\UseCase\Assistance\NormalizeAssistanceTypeDocumentSlotsAction;
use App\Core\ActionCenter\UseCase\Assistance\UpdateAssistanceTypeAction;
use App\External\Api\Request\ActionCenter\StoreAssistanceTypeRequest;
use App\External\Api\Resources\ActionCenter\AssistanceType\AssistanceTypeDetailsResource;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
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
        $table->softDeletes();
        $table->timestamps();
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
    });

    $idGenerator = new class implements IdGeneratorInterface {
        public function generate(): string
        {
            return (string) str()->ulid();
        }
    };

    $normalizeDocumentSlots = new NormalizeAssistanceTypeDocumentSlotsAction();
    $this->storeAction = new StoreAssistanceTypeAction($idGenerator, $normalizeDocumentSlots);
    $this->updateAction = new UpdateAssistanceTypeAction($idGenerator, $normalizeDocumentSlots);
});

afterEach(function () {
    app()->forgetInstance('municipal_id');

    Schema::dropIfExists('ac_assistance_type_documents');
    Schema::dropIfExists('ac_document_types');
    Schema::dropIfExists('ac_assistance_types');
});

it('generates a URL-safe slug from the assistance type name', function () {
    $medical = $this->storeAction->execute(storeDto('MEDICAL'), 'municipality-a');
    $medicalAssistance = $this->storeAction->execute(storeDto('MEDICAL ASSISTANCE'), 'municipality-a');

    expect($medical->slug)->toBe('medical')
        ->and($medicalAssistance->slug)->toBe('medical-assistance');
});

it('stores a zero minimum when the field is left blank', function () {
    $assistanceType = $this->storeAction->execute(storeDto('Financial Assistance'), 'municipality-a');

    expect($assistanceType->min_amount)->toBe('0.00')
        ->and($assistanceType->max_amount)->toBeNull();
});

it('blocks a duplicate slug within the same municipality', function () {
    $this->storeAction->execute(storeDto('Medical Assistance'), 'municipality-a');

    expect(fn() => $this->storeAction->execute(storeDto('Medical-Assistance'), 'municipality-a'))
        ->toThrow(AssistanceTypeException::class, 'already exists in this municipality');
});

it('allows the same slug in different municipalities', function () {
    $first = $this->storeAction->execute(storeDto('Medical Assistance'), 'municipality-a');
    $second = $this->storeAction->execute(storeDto('Medical Assistance'), 'municipality-b');

    expect($first->slug)->toBe('medical-assistance')
        ->and($second->slug)->toBe('medical-assistance')
        ->and($first->municipal_id)->not->toBe($second->municipal_id);
});

it('keeps the slug stable when the assistance type name changes', function () {
    $assistanceType = $this->storeAction->execute(storeDto('Medical Assistance'), 'municipality-a');

    $this->updateAction->execute(new UpdateAssistanceTypeDto(
        name: 'Hospital Assistance',
        description: 'Updated description',
        minAmount: 0,
        maxAmount: 5000,
        cooldownMonths: 3,
        isActive: true,
        documents: [],
    ), $assistanceType->id, 'municipality-a');

    expect($assistanceType->fresh()->slug)->toBe('medical-assistance');
});

it('automatically attaches conditional recipient id slots when filer id is configured', function () {
    $now = now();
    $documents = collect([
        'valid_id_front',
        'valid_id_back',
        'recipient_valid_id_front',
        'recipient_valid_id_back',
    ])->mapWithKeys(function (string $key) use ($now) {
        $id = (string) Str::ulid();
        DB::table('ac_document_types')->insert([
            'id' => $id,
            'key' => $key,
            'label' => str($key)->replace('_', ' ')->title(),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return [$key => $id];
    });

    $dto = storeDto('Medical Assistance');
    $dto = new StoreAssistanceTypeDto(
        name: $dto->name,
        description: $dto->description,
        minAmount: $dto->minAmount,
        maxAmount: $dto->maxAmount,
        cooldownMonths: $dto->cooldownMonths,
        isActive: $dto->isActive,
        documents: [
            [
                'id' => $documents['valid_id_front'],
                'is_required' => true,
                'physical_copy_requirement' => 'photocopy',
            ],
            [
                'id' => $documents['valid_id_back'],
                'is_required' => true,
                'physical_copy_requirement' => 'original_or_certified_true_copy',
            ],
        ],
    );

    $assistanceType = $this->storeAction->execute($dto, 'municipality-a');
    $pivots = DB::table('ac_assistance_type_documents')
        ->where('assistance_type_id', $assistanceType->id)
        ->get()
        ->keyBy('document_type_id');

    expect($pivots)->toHaveCount(4)
        ->and((bool) $pivots[$documents['valid_id_front']]->is_required)->toBeTrue()
        ->and((bool) $pivots[$documents['valid_id_back']]->is_required)->toBeTrue()
        ->and((bool) $pivots[$documents['recipient_valid_id_front']]->is_required)->toBeFalse()
        ->and((bool) $pivots[$documents['recipient_valid_id_back']]->is_required)->toBeFalse()
        ->and($pivots[$documents['valid_id_front']]->physical_copy_requirement)->toBe('photocopy')
        ->and($pivots[$documents['recipient_valid_id_front']]->physical_copy_requirement)->toBe('photocopy')
        ->and($pivots[$documents['valid_id_back']]->physical_copy_requirement)->toBe('original_or_certified_true_copy')
        ->and($pivots[$documents['recipient_valid_id_back']]->physical_copy_requirement)->toBe('original_or_certified_true_copy');
});

it('updates a document physical copy requirement independently of required status', function () {
    $documentId = (string) Str::ulid();
    DB::table('ac_document_types')->insert([
        'id' => $documentId,
        'key' => 'birth_certificate',
        'label' => 'Birth Certificate',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $assistanceType = $this->storeAction->execute(new StoreAssistanceTypeDto(
        name: 'Educational Assistance',
        description: 'Test assistance type',
        minAmount: 0,
        maxAmount: 5000,
        cooldownMonths: 6,
        isActive: true,
        documents: [[
            'id' => $documentId,
            'is_required' => true,
            'physical_copy_requirement' => 'photocopy',
        ]],
    ), 'municipality-a');

    $this->updateAction->execute(new UpdateAssistanceTypeDto(
        name: 'Educational Assistance',
        description: 'Updated description',
        minAmount: 0,
        maxAmount: 5000,
        cooldownMonths: 6,
        isActive: true,
        documents: [[
            'id' => $documentId,
            'is_required' => true,
            'physical_copy_requirement' => 'original',
        ]],
    ), $assistanceType->id, 'municipality-a');

    $pivot = DB::table('ac_assistance_type_documents')
        ->where('assistance_type_id', $assistanceType->id)
        ->where('document_type_id', $documentId)
        ->first();
    $resource = (new AssistanceTypeDetailsResource(
        $assistanceType->fresh()->load('documents'),
    ))->resolve();

    expect((bool) $pivot->is_required)->toBeTrue()
        ->and($pivot->physical_copy_requirement)->toBe('original')
        ->and($resource['documents'][0]['physical_copy_requirement'])->toBe('original')
        ->and($resource['documents'][0]['physical_copy_requirement_label'])->toBe('Original');
});

it('shows only global and current municipality document types', function () {
    $now = now();
    $globalId = (string) Str::ulid();
    $currentMunicipalityId = (string) Str::ulid();
    $otherMunicipalityId = (string) Str::ulid();

    DB::table('ac_document_types')->insert([
        [
            'id' => $globalId,
            'municipal_id' => null,
            'key' => 'global_document',
            'label' => 'Global Document',
            'created_at' => $now,
            'updated_at' => $now,
        ],
        [
            'id' => $currentMunicipalityId,
            'municipal_id' => 'municipality-a',
            'key' => 'municipality_a_document',
            'label' => 'Municipality A Document',
            'created_at' => $now,
            'updated_at' => $now,
        ],
        [
            'id' => $otherMunicipalityId,
            'municipal_id' => 'municipality-b',
            'key' => 'municipality_b_document',
            'label' => 'Municipality B Document',
            'created_at' => $now,
            'updated_at' => $now,
        ],
    ]);

    $visibleIds = (new GetActiveDocumentTypesForDropdown())
        ->execute('municipality-a')
        ->pluck('id');

    expect($visibleIds)
        ->toContain($globalId, $currentMunicipalityId)
        ->not->toContain($otherMunicipalityId);
});

it('rejects a custom document type owned by another municipality', function () {
    $documentId = (string) Str::ulid();

    DB::table('ac_document_types')->insert([
        'id' => $documentId,
        'municipal_id' => 'municipality-b',
        'key' => 'municipality_b_only',
        'label' => 'Municipality B Only',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $dto = new StoreAssistanceTypeDto(
        name: 'Tenant Guard Test',
        description: 'Test assistance type',
        minAmount: 0,
        maxAmount: 5000,
        cooldownMonths: 3,
        isActive: true,
        documents: [[
            'id' => $documentId,
            'is_required' => true,
            'physical_copy_requirement' => 'original',
        ]],
    );

    expect(fn () => $this->storeAction->execute($dto, 'municipality-a'))
        ->toThrow(ValidationException::class);
});

it('rejects foreign custom document types during request validation', function () {
    $globalDocumentId = (string) Str::ulid();
    $foreignDocumentId = (string) Str::ulid();
    $now = now();

    DB::table('ac_document_types')->insert([
        [
            'id' => $globalDocumentId,
            'municipal_id' => null,
            'key' => 'request_global_document',
            'label' => 'Request Global Document',
            'created_at' => $now,
            'updated_at' => $now,
        ],
        [
            'id' => $foreignDocumentId,
            'municipal_id' => 'municipality-b',
            'key' => 'request_foreign_document',
            'label' => 'Request Foreign Document',
            'created_at' => $now,
            'updated_at' => $now,
        ],
    ]);

    app()->instance('municipal_id', 'municipality-a');

    $payload = fn (string $documentId): array => [
        'name' => 'Medical Assistance',
        'description' => 'Test assistance type',
        'min_amount' => 0,
        'max_amount' => 5000,
        'cooldown_months' => 3,
        'is_active' => true,
        'documents' => [[
            'id' => $documentId,
            'is_required' => true,
            'physical_copy_requirement' => 'original',
        ]],
    ];

    $request = new StoreAssistanceTypeRequest();

    expect(Validator::make($payload($globalDocumentId), $request->rules())->passes())->toBeTrue()
        ->and(Validator::make($payload($foreignDocumentId), $request->rules())->fails())->toBeTrue();
});

it('prevents another municipality from updating an assistance type', function () {
    $assistanceType = $this->storeAction->execute(storeDto('Tenant Owned Assistance'), 'municipality-a');

    $dto = new UpdateAssistanceTypeDto(
        name: 'Changed by Another Municipality',
        description: 'This update must not be applied.',
        minAmount: 0,
        maxAmount: 5000,
        cooldownMonths: 3,
        isActive: true,
        documents: [],
    );

    expect(fn () => $this->updateAction->execute($dto, $assistanceType->id, 'municipality-b'))
        ->toThrow(ModelNotFoundException::class);

    expect($assistanceType->fresh()->name)->toBe('Tenant Owned Assistance');
});

function storeDto(string $name, ?float $minAmount = null, ?float $maxAmount = null): StoreAssistanceTypeDto
{
    return new StoreAssistanceTypeDto(
        name: $name,
        description: 'Test assistance type',
        minAmount: $minAmount ?? 0.0,
        maxAmount: $maxAmount,
        cooldownMonths: 3,
        isActive: true,
        documents: [],
    );
}
