<?php

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceRequestSnapshot;
use App\Core\ActionCenter\UseCase\Assistance\ListAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestListResource;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function (): void {
    activity()->disableLogging();

    Schema::create('ac_assistance_types', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('encoded_by_user_id')->nullable();
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->json('metadata')->nullable();
        $table->string('transaction_number');
        $table->string('status');
        $table->text('description')->nullable();
        $table->text('remarks')->nullable();
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->ulid('approved_by_user_id')->nullable();
        $table->ulid('rejected_by_user_id')->nullable();
        $table->ulid('cancelled_by_user_id')->nullable();
        $table->ulid('released_by_user_id')->nullable();
        $table->string('release_reference_number')->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamp('rejected_at')->nullable();
        $table->timestamp('cancelled_at')->nullable();
        $table->timestamp('privacy_consented_at');
        $table->string('privacy_notice_version');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id')->unique();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('religion')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->nullable();
        $table->decimal('household_total_income', 10, 2)->nullable();
        $table->string('barangay')->nullable();
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
        $table->timestamps();
    });

    Schema::create('media', function (Blueprint $table): void {
        $table->id();
        $table->ulidMorphs('model');
        $table->uuid()->nullable()->unique();
        $table->string('collection_name');
        $table->string('name');
        $table->string('file_name');
        $table->string('mime_type')->nullable();
        $table->string('disk');
        $table->string('conversions_disk')->nullable();
        $table->unsignedBigInteger('size');
        $table->json('manipulations');
        $table->json('custom_properties');
        $table->json('generated_conversions');
        $table->json('responsive_images');
        $table->unsignedInteger('order_column')->nullable();
        $table->nullableTimestamps();
    });
});

afterEach(function (): void {
    activity()->enableLogging();

    foreach (['media', 'ac_assistance_request_snapshots', 'ac_assistance_requests', 'ac_assistance_types'] as $table) {
        Schema::dropIfExists($table);
    }
});

it('searches transaction and filer names case-insensitively across all name fields', function (): void {
    $municipalId = (string) Str::ulid();
    $request = createListSearchRequest($municipalId, [
        'first_name' => 'MARIA',
        'middle_name' => 'CLARA',
        'last_name' => 'DELA CRUZ',
        'suffix' => 'JR',
    ], [
        'transaction_number' => 'REQ-2026-0001',
    ]);

    $action = app(ListAssistanceRequestAction::class);

    expect(listSearchIds($action, $municipalId, 'maria clara'))->toContain($request->id)
        ->and(listSearchIds($action, $municipalId, 'cruz dela'))->toContain($request->id)
        ->and(listSearchIds($action, $municipalId, 'jr'))->toContain($request->id)
        ->and(listSearchIds($action, $municipalId, 'req-2026-0001'))->toContain($request->id);
});

it('searches the assisted person without combining words from different identities', function (): void {
    $municipalId = (string) Str::ulid();
    $request = createListSearchRequest($municipalId, [
        'first_name' => 'MARIA',
        'last_name' => 'SANTOS',
    ], [
        'metadata' => [
            'relationship_to_beneficiary' => 'parent',
            'on_behalf_first_name' => 'PEDRO',
            'on_behalf_middle_name' => 'JUAN',
            'on_behalf_last_name' => 'REJANO',
        ],
    ]);

    $action = app(ListAssistanceRequestAction::class);

    expect(listSearchIds($action, $municipalId, 'pedro rejano'))->toContain($request->id)
        ->and(listSearchIds($action, $municipalId, 'maria pedro'))->toBeEmpty();
});

it('preserves municipality, status, reviewer, and pagination filters', function (): void {
    $municipalId = (string) Str::ulid();
    $otherMunicipalId = (string) Str::ulid();
    $reviewerId = (string) Str::ulid();

    $matching = createListSearchRequest($municipalId, [
        'first_name' => 'JUAN',
        'last_name' => 'DELA CRUZ',
    ], [
        'status' => 'under_review',
        'reviewed_by_user_id' => $reviewerId,
    ]);

    createListSearchRequest($municipalId, [
        'first_name' => 'JUAN',
        'last_name' => 'DELA CRUZ',
    ], [
        'status' => 'approved',
        'reviewed_by_user_id' => $reviewerId,
    ]);

    createListSearchRequest($otherMunicipalId, [
        'first_name' => 'JUAN',
        'last_name' => 'DELA CRUZ',
    ], [
        'status' => 'under_review',
        'reviewed_by_user_id' => $reviewerId,
    ]);

    $paginator = app(ListAssistanceRequestAction::class)->execute($municipalId, [
        'search' => 'juan dela',
        'status' => 'under_review',
        'reviewed_by_user_id' => $reviewerId,
        'per_page' => 1,
    ]);

    expect($paginator->total())->toBe(1)
        ->and($paginator->perPage())->toBe(1)
        ->and($paginator->getCollection()->pluck('id')->all())->toBe([$matching->id]);
});

it('exposes filer and assisted-person names distinctly in list resources', function (): void {
    $municipalId = (string) Str::ulid();
    $selfFiled = createListSearchRequest($municipalId, [
        'first_name' => 'MARIA',
        'middle_name' => 'CLARA',
        'last_name' => 'SANTOS',
    ]);
    $onBehalf = createListSearchRequest($municipalId, [
        'first_name' => 'MARIA',
        'last_name' => 'SANTOS',
    ], [
        'metadata' => [
            'relationship_to_beneficiary' => 'parent',
            'on_behalf_first_name' => 'PEDRO',
            'on_behalf_last_name' => 'REJANO',
        ],
    ]);

    $selfData = (new AssistanceRequestListResource($selfFiled->load('snapshot')))->toArray(Request::create('/'));
    $onBehalfData = (new AssistanceRequestListResource($onBehalf->load('snapshot')))->toArray(Request::create('/'));

    expect($selfData['filer_full_name'])->toBe('MARIA CLARA SANTOS')
        ->and($selfData['subject_full_name'])->toBe('MARIA CLARA SANTOS')
        ->and($onBehalfData['filer_full_name'])->toBe('MARIA SANTOS')
        ->and($onBehalfData['subject_full_name'])->toBe('PEDRO REJANO');
});

/** @param array<string, mixed> $snapshotData */
/** @param array<string, mixed> $requestData */
function createListSearchRequest(string $municipalId, array $snapshotData, array $requestData = []): AssistanceRequest
{
    $now = now();
    $assistanceTypeId = (string) Str::ulid();

    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'municipal_id' => $municipalId,
        'name' => 'Medical Assistance',
        'slug' => 'medical',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $request = AssistanceRequest::create(array_merge([
        'municipal_id' => $municipalId,
        'beneficiary_id' => (string) Str::ulid(),
        'household_id' => (string) Str::ulid(),
        'assistance_type_id' => $assistanceTypeId,
        'metadata' => [],
        'transaction_number' => 'REQ-'.strtoupper(Str::random(8)),
        'status' => 'pending',
        'description' => 'Assistance request for list search testing.',
        'privacy_consented_at' => $now,
        'privacy_notice_version' => 'v1.0',
        'created_at' => $now,
        'updated_at' => $now,
    ], $requestData));

    AssistanceRequestSnapshot::create(array_merge([
        'assistance_request_id' => $request->id,
        'first_name' => 'UNKNOWN',
        'last_name' => 'PERSON',
        'created_at' => $now,
        'updated_at' => $now,
    ], $snapshotData));

    return $request->fresh(['snapshot']);
}

/** @return array<int, string> */
function listSearchIds(ListAssistanceRequestAction $action, string $municipalId, string $search): array
{
    return $action->execute($municipalId, [
        'search' => $search,
        'per_page' => 100,
    ])->getCollection()->pluck('id')->all();
}
