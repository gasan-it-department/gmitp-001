<?php

use App\Core\ActionCenter\Dto\Assistance\CertificateOfEligibilityData;
use App\Core\ActionCenter\Dto\Assistance\GenerateCertificateOfEligibilityDto;
use App\Core\ActionCenter\UseCase\Assistance\GenerateCertificateOfEligibilityAction;
use App\External\Api\Request\ActionCenter\GenerateCertificateOfEligibilityRequest;
use App\External\Documents\ActionCenter\Pdf\CertificateOfEligibilityPdf;
use Carbon\CarbonImmutable;
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
        $table->string('psgc_municipal_id')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('municipality_settings', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('trunkline_phone')->nullable();
        $table->timestamps();
    });

    Schema::create('psgc_provinces', function (Blueprint $table) {
        $table->id();
        $table->string('name');
    });

    Schema::create('psgc_municipalities', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('province_id')->nullable();
        $table->string('name');
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->string('model_id');
        $table->string('collection_name');
        $table->unsignedInteger('order_column')->nullable();
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
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('street')->nullable();
        $table->string('barangay')->nullable();
        $table->timestamps();
    });
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_assistance_types',
        'media',
        'municipality_settings',
        'psgc_municipalities',
        'psgc_provinces',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('uses the frozen claimant snapshot and trusted municipality data', function () {
    $context = seedCertificateOfEligibilityContext(status: 'under_review', reviewed: true);

    $data = app(GenerateCertificateOfEligibilityAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->subjectName)->toBe('Share Mae Rejano')
        ->and($data->subjectCivilStatus)->toBe('Single')
        ->and($data->address)->toBe('Purok 2, Brgy. Bognuyan, Gasan, Marinduque')
        ->and($data->assistanceType)->toBe('Medical Assistance');
});

it('uses the frozen assisted person for on-behalf certificates', function () {
    $context = seedCertificateOfEligibilityContext(metadata: [
        'relationship_to_beneficiary' => 'parent',
        'on_behalf_first_name' => 'Juan',
        'on_behalf_last_name' => 'Rejano',
        'on_behalf_birth_date' => '1980-02-03',
        'on_behalf_civil_status' => 'married',
    ]);

    $data = app(GenerateCertificateOfEligibilityAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->subjectName)->toBe('Juan Rejano')
        ->and($data->subjectCivilStatus)->toBe('Married')
        ->and($data->subjectName)->not->toBe('Share Mae Rejano');
});

it('requires a started review and rejects terminal or pending requests', function () {
    foreach (['pending', 'rejected', 'cancelled'] as $status) {
        $context = seedCertificateOfEligibilityContext(status: $status, reviewed: false);

        expect(fn () => app(GenerateCertificateOfEligibilityAction::class)->formData(
            $context['request_id'],
            $context['municipal_id'],
        ))->toThrow(DomainException::class);
    }

    $notStarted = seedCertificateOfEligibilityContext(status: 'under_review', reviewed: false);

    expect(fn () => app(GenerateCertificateOfEligibilityAction::class)->formData(
        $notStarted['request_id'],
        $notStarted['municipal_id'],
    ))->toThrow(DomainException::class);

    foreach (['approved', 'released'] as $status) {
        $context = seedCertificateOfEligibilityContext(status: $status, reviewed: false);

        expect(app(GenerateCertificateOfEligibilityAction::class)->formData(
            $context['request_id'],
            $context['municipal_id'],
        ))->toBeInstanceOf(\App\Core\ActionCenter\Dto\Assistance\CertificateOfEligibilityFormData::class);
    }
});

it('rejects a request from another municipality', function () {
    $context = seedCertificateOfEligibilityContext();

    expect(fn () => app(GenerateCertificateOfEligibilityAction::class)->formData(
        $context['request_id'],
        (string) Str::ulid(),
    ))->toThrow(AuthorizationException::class);
});

it('validates the manual certificate fields', function () {
    $request = new GenerateCertificateOfEligibilityRequest;
    $valid = [
        'intake_date' => '2026-08-14',
        'certified_by_name' => 'Rebecca S. Bisnar',
        'certified_by_position' => 'Social Welfare Officer III',
        'approved_by_name' => 'Hon. Lidany A. Baldo',
        'approved_by_position' => 'Acting Municipal Mayor',
    ];

    expect(Validator::make($valid, $request->rules())->passes())->toBeTrue()
        ->and(Validator::make([...$valid, 'intake_date' => '14/08/2026'], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make([...$valid, 'certified_by_name' => str_repeat('x', 151)], $request->rules())->fails())->toBeTrue();
});

it('does not write records and renders a one-page-compatible dompdf document', function () {
    $context = seedCertificateOfEligibilityContext();
    $beforeRequests = DB::table('ac_assistance_requests')->count();
    $beforeMedia = DB::table('media')->count();

    $dto = new GenerateCertificateOfEligibilityDto(
        assistanceRequestId: $context['request_id'],
        municipalId: $context['municipal_id'],
        intakeDate: CarbonImmutable::parse('2026-08-14'),
        certifiedByName: 'Rebecca S. Bisnar',
        certifiedByPosition: 'Social Welfare Officer III',
        approvedByName: 'Hon. Lidany A. Baldo',
        approvedByPosition: 'Acting Municipal Mayor',
    );

    $data = app(GenerateCertificateOfEligibilityAction::class)->execute($dto, 'Test Admin');
    $html = view('documents.action_center.certificate_of_eligibility', compact('data'))->render();
    $response = app(CertificateOfEligibilityPdf::class)->response($data);

    expect($data)->toBeInstanceOf(CertificateOfEligibilityData::class)
        ->and($html)->toContain(
            'CERTIFICATE OF ELIGIBILITY',
            'Records and supporting papers reviewed.',
            'Certified By:',
            'Approved By:',
            'Medical Assistance',
        )->not->toContain('@vite', '<script', 'http://', 'https://')
        ->and($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('content-type'))->toBe('application/pdf')
        ->and($response->getContent())->toStartWith('%PDF')
        ->and(DB::table('ac_assistance_requests')->count())->toBe($beforeRequests)
        ->and(DB::table('media')->count())->toBe($beforeMedia);
});

/** @return array{municipal_id: string, request_id: string} */
function seedCertificateOfEligibilityContext(
    ?array $metadata = null,
    string $status = 'approved',
    bool $reviewed = true,
): array {
    $municipalId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $now = now();

    $psgcProvinceId = DB::table('psgc_provinces')->insertGetId([
        'name' => 'Marinduque',
    ]);

    $psgcMunicipalId = DB::table('psgc_municipalities')->insertGetId([
        'province_id' => $psgcProvinceId,
        'name' => 'Gasan',
    ]);

    DB::table('municipalities')->insert([
        'id' => $municipalId,
        'name' => 'Gasan',
        'slug' => 'gasan-4905-'.Str::lower(Str::random(4)),
        'municipal_code' => 'GAS-'.Str::upper(Str::random(4)),
        'psgc_municipal_id' => (string) $psgcMunicipalId,
        'is_active' => true,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('municipality_settings')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'trunkline_phone' => '(042) 342-1572',
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

    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'beneficiary_id' => (string) Str::ulid(),
        'household_id' => (string) Str::ulid(),
        'assistance_type_id' => $assistanceTypeId,
        'transaction_number' => 'REQ-2026-'.Str::upper(Str::random(5)),
        'status' => $status,
        'amount_approved' => 1000,
        'metadata' => $metadata ? json_encode($metadata, JSON_THROW_ON_ERROR) : null,
        'reviewed_at' => $reviewed ? '2026-08-13 10:00:00' : null,
        'approved_at' => in_array($status, ['approved', 'released'], true) ? '2026-08-16 10:00:00' : null,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => 'Share Mae',
        'last_name' => 'Rejano',
        'sex' => 'female',
        'birth_date' => '1990-01-01',
        'civil_status' => 'single',
        'street' => 'Purok 2',
        'barangay' => 'Bognuyan',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return [
        'municipal_id' => $municipalId,
        'request_id' => $requestId,
    ];
}
