<?php

use App\Core\ActionCenter\Dto\Report\AssistanceRequestReportFiltersDto;
use App\Core\ActionCenter\Dto\Report\BeneficiaryRegistryReportFiltersDto;
use App\Core\ActionCenter\UseCase\Report\ListAssistanceRequestReportAction;
use App\Core\ActionCenter\UseCase\Report\ListBeneficiaryRegistryReportAction;
use App\External\Documents\ActionCenter\Excel\ActionCenterReportExport;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Excel as ExcelWriter;
use Maatwebsite\Excel\Facades\Excel;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name');
        $table->string('last_name');
        $table->timestamps();
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->string('barangay');
        $table->string('street')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('user_id')->nullable();
        $table->ulid('municipal_id');
        $table->boolean('is_active')->default(true);
        $table->ulid('merged_into_beneficiary_id')->nullable();
        $table->timestamp('identity_verified_at')->nullable();
        $table->timestamp('intake_rejected_at')->nullable();
        $table->string('beneficiary_number')->nullable();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date');
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->string('contact_phone')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('relationship');
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
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
        $table->ulid('encoded_by_user_id')->nullable();
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->ulid('approved_by_user_id')->nullable();
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->json('metadata')->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->text('description')->nullable();
        $table->string('release_reference_number')->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
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
        $table->string('barangay')->nullable();
        $table->timestamps();
    });
});

afterEach(function () {
    foreach ([
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_assistance_types',
        'ac_household_members',
        'ac_beneficiaries',
        'ac_households',
        'users',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('keeps assistance reports tenant scoped and uses frozen request identity', function () {
    $tenant = seedReportTenant('municipality-a', 'Current Beneficiary', 'GAS-000001', 'Tiguion');
    $otherTenant = seedReportTenant('municipality-b', 'Other Municipality', 'BOA-000001', 'Boac');
    $staffId = (string) Str::ulid();
    DB::table('users')->insert([
        'id' => $staffId,
        'first_name' => 'Maria',
        'last_name' => 'Reviewer',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    seedReportRequest($tenant, 'AC-2026-000001', 'Original Snapshot', 2500, $staffId);
    seedReportRequest($otherTenant, 'AC-2026-000002', 'Foreign Snapshot', 9000, $staffId);

    $action = new ListAssistanceRequestReportAction;
    $filters = AssistanceRequestReportFiltersDto::fromArray([]);
    $rows = $action->execute('municipality-a', $filters);
    $summary = $action->summary('municipality-a', $filters);

    expect($rows->total())->toBe(1)
        ->and($rows->items()[0]['filer_name'])->toBe('Original Snapshot')
        ->and($rows->items()[0]['filer_name'])->not->toBe('Current Beneficiary')
        ->and($summary['released'])->toBe(1)
        ->and($summary['released_amount'])->toBe(2500.0);
});

it('uses current beneficiary data and authoritative household size in the registry report', function () {
    $tenant = seedReportTenant('municipality-a', 'Current Beneficiary', 'GAS-000001', 'Tiguion');
    seedReportRequest($tenant, 'AC-2026-000001', 'Earlier Snapshot', 1500);

    DB::table('ac_household_members')->insert([
        reportMember($tenant['householdId'], 'Current', 'Beneficiary', 'head', true, false),
        reportMember($tenant['householdId'], 'Verified', 'Dependent', 'child', true, true),
        reportMember($tenant['householdId'], 'Pending', 'Dependent', 'child', true, false),
        reportMember($tenant['householdId'], 'Moved', 'Out', 'sibling', false, true),
    ]);

    $action = new ListBeneficiaryRegistryReportAction;
    $filters = BeneficiaryRegistryReportFiltersDto::fromArray([]);
    $rows = $action->execute('municipality-a', $filters);
    $row = $rows->items()[0];

    expect($rows->total())->toBe(1)
        ->and($row['full_name'])->toBe('Current Beneficiary')
        ->and($row['official_household_size'])->toBe(2)
        ->and($row['released_requests'])->toBe(1)
        ->and($row['total_released_amount'])->toBe(1500.0);
});

it('renders the report workbook with metadata and currency formatting', function () {
    $workbook = Excel::raw(
        new ActionCenterReportExport(
            title: 'Action Center Test Report',
            municipalityName: 'Municipality of Gasan',
            generatedBy: 'Test Administrator',
            filterSummary: 'All records',
            headings: ['Reference', 'Amount'],
            rows: [['AC-2026-000001', 2500]],
            currencyColumns: ['B'],
        ),
        ExcelWriter::XLSX,
    );

    expect($workbook)->not->toBeEmpty();
});

function seedReportTenant(string $municipalId, string $name, string $beneficiaryNumber, string $barangay): array
{
    [$firstName, $lastName] = explode(' ', $name, 2);
    $householdId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $now = now();

    DB::table('ac_households')->insert([
        'id' => $householdId,
        'municipal_id' => $municipalId,
        'household_code' => 'HH-'.strtoupper(substr($municipalId, -1)).'-001',
        'barangay' => $barangay,
        'street' => 'Main Street',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'household_id' => $householdId,
        'municipal_id' => $municipalId,
        'is_active' => true,
        'identity_verified_at' => $now,
        'beneficiary_number' => $beneficiaryNumber,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'civil_status' => 'single',
        'monthly_income' => 1000,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'municipal_id' => $municipalId,
        'name' => 'Medical Assistance',
        'slug' => 'medical-assistance',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return compact('municipalId', 'householdId', 'beneficiaryId', 'assistanceTypeId', 'beneficiaryNumber', 'barangay');
}

function seedReportRequest(array $tenant, string $transactionNumber, string $snapshotName, float $amount, ?string $staffId = null): void
{
    [$firstName, $lastName] = explode(' ', $snapshotName, 2);
    $requestId = (string) Str::ulid();
    $now = now();

    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $tenant['municipalId'],
        'beneficiary_id' => $tenant['beneficiaryId'],
        'household_id' => $tenant['householdId'],
        'assistance_type_id' => $tenant['assistanceTypeId'],
        'reviewed_by_user_id' => $staffId,
        'approved_by_user_id' => $staffId,
        'amount_approved' => $amount,
        'transaction_number' => $transactionNumber,
        'status' => 'released',
        'description' => 'Medical support',
        'release_reference_number' => 'REF-'.$transactionNumber,
        'reviewed_at' => $now,
        'approved_at' => $now,
        'released_at' => $now,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'barangay' => $tenant['barangay'],
        'created_at' => $now,
        'updated_at' => $now,
    ]);
}

function reportMember(string $householdId, string $firstName, string $lastName, string $relationship, bool $active, bool $verified): array
{
    return [
        'id' => (string) Str::ulid(),
        'household_id' => $householdId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'relationship' => $relationship,
        'is_active' => $active,
        'is_verified_dependent' => $verified,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}
