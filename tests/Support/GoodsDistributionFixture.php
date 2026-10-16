<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction;
use App\Core\GoodsDistribution\Actions\TransitionDistributionRequestAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

require_once __DIR__.'/GoodsInventoryFixture.php';

function goodsDistributionFixture(object $test): void
{
    config(['goods_distribution.document_disk' => 'local']);
    goodsInventoryFixture($test);
    Schema::create('ac_households', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('municipal_id');
        $t->string('household_code');
        $t->string('barangay')->nullable();
        $t->string('street')->nullable();
        $t->softDeletes();
        $t->timestamps();
    });
    Schema::create('ac_beneficiaries', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('municipal_id');
        $t->ulid('household_id');
        $t->string('beneficiary_number')->nullable();
        foreach (['first_name', 'middle_name', 'last_name', 'suffix', 'sex'] as $field) {
            $t->string($field)->nullable();
        }
        $t->date('birth_date')->nullable();
        $t->boolean('is_active')->default(true);
        $t->ulid('merged_into_beneficiary_id')->nullable();
        $t->timestamp('identity_verified_at')->nullable();
        $t->softDeletes();
        $t->timestamps();
    });
    Schema::create('ac_household_members', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('household_id');
        $t->ulid('beneficiary_id')->nullable();
        foreach (['first_name', 'middle_name', 'last_name', 'suffix', 'sex', 'relationship'] as $field) {
            $t->string($field)->nullable();
        }
        $t->date('birth_date')->nullable();
        $t->boolean('is_active')->default(true);
        $t->softDeletes();
        $t->timestamps();
    });
    (require database_path('migrations/2026_01_21_142715_create_ac_document_types_table.php'))->up();
    (require database_path('migrations/2026_07_22_000002_add_municipal_id_to_ac_document_types.php'))->up();
    (require database_path('migrations/2026_04_20_170122_create_media_table.php'))->up();
    foreach (glob(database_path('migrations/2026_10_09_*.php')) as $path) {
        (require $path)->up();
    }
    foreach (glob(database_path('migrations/2026_10_13_*gd_*.php')) as $path) {
        (require $path)->up();
    }
    foreach (glob(database_path('migrations/2026_10_14_*gd_*.php')) as $path) {
        (require $path)->up();
    }
    foreach (glob(database_path('migrations/2026_10_15_*gd_*.php')) as $path) {
        (require $path)->up();
    }
    $test->actor->givePermissionTo(['goods_distribution.access', 'goods_distribution.requests.view', 'goods_distribution.requests.intake',
        'goods_distribution.requests.process', 'goods_distribution.requests.decide', 'goods_distribution.requests.release',
        'goods_distribution.inventory.view', 'goods_distribution.inventory.manage', 'goods_distribution.inventory.adjust']);
    $test->household = Household::create(['municipal_id' => $test->municipalId, 'household_code' => 'HH-GD-1', 'barangay' => 'Uno', 'street' => 'Main']);
    $test->filer = Beneficiary::create(['municipal_id' => $test->municipalId, 'household_id' => $test->household->id,
        'beneficiary_number' => 'GD-PERSON-1', 'first_name' => 'Susan', 'last_name' => 'Solis', 'birth_date' => '1960-01-01', 'sex' => 'female']);
    $test->member = HouseholdMember::create(['household_id' => $test->household->id, 'beneficiary_id' => $test->filer->id,
        'first_name' => 'Susan', 'last_name' => 'Solis', 'birth_date' => '1960-01-01', 'sex' => 'female', 'relationship' => 'head']);
}

function goodsDistributionCleanup(): void
{
    foreach (array_reverse(glob(database_path('migrations/2026_10_15_*gd_*.php'))) as $path) {
        (require $path)->down();
    }
    foreach (array_reverse(glob(database_path('migrations/2026_10_14_*gd_*.php'))) as $path) {
        (require $path)->down();
    }
    foreach (array_reverse(glob(database_path('migrations/2026_10_13_*gd_*.php'))) as $path) {
        (require $path)->down();
    }
    foreach (array_reverse(glob(database_path('migrations/2026_10_09_*.php'))) as $path) {
        (require $path)->down();
    }
    foreach (['media', 'ac_document_types', 'ac_household_members', 'ac_beneficiaries', 'ac_households'] as $table) {
        Schema::dropIfExists($table);
    }
    goodsInventoryCleanup();
}

function distributionData(object $test, array $changes = []): array
{
    return array_replace(['submission_key' => (string) Str::uuid(), 'beneficiary_id' => $test->filer->id,
        'assisted_household_member_id' => null, 'program_id' => $test->program->id, 'storage_location_id' => $test->location->id,
        'notes' => null, 'lines' => [['item_id' => $test->item->id, 'quantity' => '2']]], $changes);
}

function goodsRequest(object $test, array $changes = []): DistributionRequest
{
    return app(SaveDistributionRequestAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id, distributionData($test, $changes)));
}

function goodsTransition(object $test, DistributionRequest $request, string $command, array $data = []): DistributionRequest
{
    return app(TransitionDistributionRequestAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id,
        ['version' => $request->fresh()->version, 'operation_key' => (string) Str::uuid(), ...$data], $request->id), $command);
}

function goodsApproval(object $test, DistributionRequest $request): DistributionRequest
{
    $request = goodsTransition($test, $request, 'review');

    return goodsTransition($test, $request, 'approve', ['recipient_reviewed' => true]);
}

function goodsReleaseData(DistributionRequest $request): array
{
    return ['actual_release_on' => today()->toDateString(), 'collector_type' => 'recipient', 'identity_inspected' => true,
        'acknowledgement_confirmed' => true, 'acknowledgement_reference' => $request->reference,
        'confirmed_allocation_ids' => $request->allocations()->where('status', 'reserved')->pluck('id')->sort()->values()->all()];
}
