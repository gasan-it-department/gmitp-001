<?php

use App\Core\ActionCenter\Dto\Assistance\GenerateAssistanceRequestIntakeSheetDto;
use App\Core\ActionCenter\Enums\AssistanceIntakeProblem;
use App\Core\ActionCenter\UseCase\Assistance\GenerateAssistanceRequestIntakeSheetAction;
use App\External\Api\Request\ActionCenter\GenerateAssistanceRequestIntakeSheetRequest;
use App\External\Documents\ActionCenter\Pdf\AssistanceRequestIntakeSheetPdf;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();

    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->string('model_id');
        $table->string('collection_name');
        $table->unsignedInteger('order_column')->nullable();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('household_id');
        $table->string('beneficiary_number');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->string('transaction_number');
        $table->string('status');
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->json('metadata')->nullable();
        $table->text('description')->nullable();
        $table->text('remarks')->nullable();
        $table->timestamp('privacy_consented_at')->nullable();
        $table->string('privacy_notice_version')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id')->unique();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
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
        $table->string('street')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('sex')->nullable();
        $table->string('relationship');
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->nullable();
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'ac_household_members',
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_assistance_types',
        'ac_beneficiaries',
        'media',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('prefills trusted snapshot values and medical assessment defaults', function () {
    $context = seedAssistanceRequestIntakeSheetContext();

    $data = app(GenerateAssistanceRequestIntakeSheetAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->claimantName)->toBe('April Joy Mawac')
        ->and($data->civilStatus)->toBe('Married')
        ->and($data->barangay)->toBe('Bachao Ilaya')
        ->and($data->assistanceType)->toBe('Medical Assistance')
        ->and($data->filingSubject)->toBe('self')
        ->and($data->recommendedDefaults)->toMatchArray([
            'problem_presented' => [AssistanceIntakeProblem::SeekingMedicalAssistance->value],
            'source_of_income' => 'Fishing',
            'monthly_income' => 3000.0,
            'recommendation' => 'Medical Assistance',
        ]);
});

it('prefills burial and on-behalf context without trusting submitted identity', function () {
    $context = seedAssistanceRequestIntakeSheetContext(
        assistanceName: 'Burial Assistance',
        assistanceSlug: 'burial-assistance',
        metadata: [
            'relationship_to_beneficiary' => 'parent',
            'on_behalf_first_name' => 'Juan',
            'on_behalf_last_name' => 'Mawac',
        ],
    );

    $data = app(GenerateAssistanceRequestIntakeSheetAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->claimantName)->toBe('April Joy Mawac')
        ->and($data->filingSubject)->toBe('parent Juan Mawac')
        ->and($data->recommendedDefaults['problem_presented'])
        ->toBe([AssistanceIntakeProblem::HelplessToBuryDead->value]);
});

it('validates assessment inputs and rejects unsupported problem values', function () {
    $request = new GenerateAssistanceRequestIntakeSheetRequest;
    $valid = [
        'problem_presented' => ['sick'],
        'source_of_income' => 'Fishing',
        'monthly_income' => 0,
        'recommendation' => 'Medical Assistance',
    ];

    expect(Validator::make($valid, $request->rules())->passes())->toBeTrue()
        ->and(Validator::make([...$valid, 'problem_presented' => []], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make([...$valid, 'problem_presented' => ['unsupported']], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make([...$valid, 'source_of_income' => null], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make([...$valid, 'monthly_income' => null], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make([...$valid, 'monthly_income' => -1], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make([...$valid, 'recommendation' => ''], $request->rules())->fails())->toBeTrue();
});

it('rejects an assistance request from another municipality', function () {
    $context = seedAssistanceRequestIntakeSheetContext();

    expect(fn () => app(GenerateAssistanceRequestIntakeSheetAction::class)->formData(
        $context['request_id'],
        (string) Str::ulid(),
    ))->toThrow(AuthorizationException::class);
});

it('uses edited assessment values without writing records and returns a dompdf document', function () {
    $context = seedAssistanceRequestIntakeSheetContext();
    $beforeRequests = DB::table('ac_assistance_requests')->count();
    $beforeMedia = DB::table('media')->count();
    $beforeSnapshot = DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $context['request_id'])
        ->first(['occupation', 'monthly_income']);
    $beforeMember = DB::table('ac_household_members')->first(['occupation', 'monthly_income']);

    $dto = new GenerateAssistanceRequestIntakeSheetDto(
        assistanceRequestId: $context['request_id'],
        municipalId: $context['municipal_id'],
        problemPresented: ['sick', 'inadequate_finances'],
        sourceOfIncome: 'Seasonal farming',
        monthlyIncome: 3200.50,
        recommendation: 'Medical Assistance after assessment and completion of supporting documents',
    );

    $data = app(GenerateAssistanceRequestIntakeSheetAction::class)->execute($dto, 'Test Admin');
    $html = view('documents.action_center.assistance_request_intake_sheet', compact('data'))->render();
    $response = app(AssistanceRequestIntakeSheetPdf::class)->response($data);

    $afterSnapshot = DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $context['request_id'])
        ->first(['occupation', 'monthly_income']);
    $afterMember = DB::table('ac_household_members')->first(['occupation', 'monthly_income']);

    expect($html)->toContain(
        'III. Problem Presented:',
        'IV. Findings and Evaluation:',
        'Seasonal farming',
        'PHP 3,200.50',
        'Medical Assistance after assessment and completion of supporting documents',
        'Current Household Composition',
        'Fishing',
    )->not->toContain('@vite', '<script', 'http://', 'https://', 'display: flex', 'display: grid', 'Roster Member ID')
        ->and(substr_count($html, 'Seasonal farming'))->toBe(2)
        ->and(substr_count($html, 'PHP 3,200.50'))->toBe(2)
        ->and(substr_count($html, '>X</span>'))->toBe(2)
        ->and($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('content-type'))->toBe('application/pdf')
        ->and($response->getContent())->toStartWith('%PDF')
        ->and(DB::table('ac_assistance_requests')->count())->toBe($beforeRequests)
        ->and(DB::table('media')->count())->toBe($beforeMedia)
        ->and($afterSnapshot)->toEqual($beforeSnapshot)
        ->and($afterMember)->toEqual($beforeMember);
});

it('omits the internal roster member id from an on-behalf filing subject', function () {
    $context = seedAssistanceRequestIntakeSheetContext(metadata: [
        'relationship_to_beneficiary' => 'parent',
        'on_behalf_first_name' => 'Juan',
        'on_behalf_last_name' => 'Mawac',
    ]);
    $rosterMemberId = (string) Str::ulid();
    DB::table('ac_assistance_requests')
        ->where('id', $context['request_id'])
        ->update(['on_behalf_household_member_id' => $rosterMemberId]);

    $data = app(GenerateAssistanceRequestIntakeSheetAction::class)->execute(
        new GenerateAssistanceRequestIntakeSheetDto(
            assistanceRequestId: $context['request_id'],
            municipalId: $context['municipal_id'],
            problemPresented: ['sick'],
            sourceOfIncome: 'Fishing',
            monthlyIncome: 3000,
            recommendation: 'Medical Assistance',
        ),
        'Test Admin',
    );
    $html = view('documents.action_center.assistance_request_intake_sheet', compact('data'))->render();

    expect($html)->toContain('Relationship', 'Subject Name', 'Juan Mawac')
        ->not->toContain('Roster Member ID', $rosterMemberId);
});

/** @return array{municipal_id: string, request_id: string} */
function seedAssistanceRequestIntakeSheetContext(
    string $assistanceName = 'Medical Assistance',
    string $assistanceSlug = 'medical-assistance',
    ?array $metadata = null,
): array {
    $municipalId = (string) Str::ulid();
    $householdId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $now = now();

    DB::table('municipalities')->insert([
        'id' => $municipalId,
        'name' => 'Gasan',
        'slug' => 'gasan-'.Str::lower(Str::random(5)),
        'municipal_code' => 'GAS-'.Str::upper(Str::random(5)),
        'is_active' => true,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'municipal_id' => $municipalId,
        'household_id' => $householdId,
        'beneficiary_number' => 'GAS-000001',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'municipal_id' => $municipalId,
        'name' => $assistanceName,
        'slug' => $assistanceSlug,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'beneficiary_id' => $beneficiaryId,
        'household_id' => $householdId,
        'assistance_type_id' => $assistanceTypeId,
        'transaction_number' => 'REQ-2026-0001',
        'status' => 'under_review',
        'amount_approved' => null,
        'metadata' => $metadata ? json_encode($metadata, JSON_THROW_ON_ERROR) : null,
        'description' => 'Requesting financial support for hospital expenses.',
        'privacy_consented_at' => $now,
        'privacy_notice_version' => '2026-01',
        'created_at' => '2026-08-20 09:30:00',
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => 'April Joy',
        'last_name' => 'Mawac',
        'sex' => 'female',
        'birth_date' => '1990-06-14',
        'educational_attainment' => 'college_grad',
        'religion' => 'Roman Catholic',
        'civil_status' => 'married',
        'occupation' => 'Fishing',
        'monthly_income' => 3000,
        'household_total_income' => 4500,
        'barangay' => 'Bachao Ilaya',
        'street' => 'Purok 2',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $householdId,
        'beneficiary_id' => $beneficiaryId,
        'first_name' => 'April Joy',
        'last_name' => 'Mawac',
        'birth_date' => '1990-06-14',
        'educational_attainment' => 'college_grad',
        'sex' => 'female',
        'relationship' => 'head',
        'occupation' => 'Fishing',
        'monthly_income' => 3000,
        'is_active' => true,
        'is_verified_dependent' => false,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return ['municipal_id' => $municipalId, 'request_id' => $requestId];
}
