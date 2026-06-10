<?php

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceTypeDto;
use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceTypeDto;
use App\Core\ActionCenter\Exceptions\AssistanceTypeException;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceTypeAction;
use App\Core\ActionCenter\UseCase\Assistance\UpdateAssistanceTypeAction;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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

    Schema::create('ac_assistance_type_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_type_id');
        $table->ulid('document_type_id');
        $table->boolean('is_required')->default(true);
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    $idGenerator = new class implements IdGeneratorInterface {
        public function generate(): string
        {
            return (string) str()->ulid();
        }
    };

    $this->storeAction = new StoreAssistanceTypeAction($idGenerator);
    $this->updateAction = new UpdateAssistanceTypeAction($idGenerator);
});

afterEach(function () {
    Schema::dropIfExists('ac_assistance_type_documents');
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
    ), $assistanceType->id);

    expect($assistanceType->fresh()->slug)->toBe('medical-assistance');
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
