<?php

use App\Core\ActionCenter\Dto\Assistance\ObligationRequestData;
use App\Core\ActionCenter\UseCase\Assistance\GenerateObligationRequestAction;
use App\External\Documents\ActionCenter\Pdf\ObligationRequestPdf;
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
        $table->string('transaction_number');
        $table->string('status');
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->json('metadata')->nullable();
        $table->timestamp('approved_at')->nullable();
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
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('builds trusted form data from the frozen request snapshot', function () {
    $context = seedObligationRequestContext();
    DB::table('municipalities')
        ->where('id', $context['municipal_id'])
        ->update(['municipal_code' => '174003000']);

    $data = app(GenerateObligationRequestAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->payee)->toBe('Share Mae Rejano')
        ->and($data->address)->toBe('Purok 2, Brgy. Bognuyan, Gasan, Marinduque')
        ->and($data->approvedAmount)->toBe(1000.0)
        ->and($data->suggestedParticulars)->toContain('Payment for Medical Assistance')
        ->and($data->suggestedParticulars)->toContain('Situation (AICS) CY 2026')
        ->and($data->recommendedDefaults['number_prefix'])->toBe('200-2026-08-')
        ->and($data->recommendedDefaults['responsibility_center'])->toBe('7611')
        ->and($data->recommendedDefaults['account_code'])->toBe('5-02-99-080');
});

it('keeps the claimant as payee and mentions the assisted person for on-behalf requests', function () {
    $context = seedObligationRequestContext([
        'relationship_to_beneficiary' => 'parent',
        'on_behalf_first_name' => 'Juan',
        'on_behalf_last_name' => 'Rejano',
    ]);

    $data = app(GenerateObligationRequestAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->payee)->toBe('Share Mae Rejano')
        ->and($data->suggestedParticulars)->toContain('For: Juan Rejano');
});

it('rejects ineligible status and cross-municipality generation', function () {
    $pending = seedObligationRequestContext(status: 'pending');
    $action = app(GenerateObligationRequestAction::class);

    expect(fn () => $action->formData($pending['request_id'], $pending['municipal_id']))
        ->toThrow(DomainException::class);

    $approved = seedObligationRequestContext();

    expect(fn () => $action->formData($approved['request_id'], (string) Str::ulid()))
        ->toThrow(AuthorizationException::class);
});

it('validates only the manual obligation request fields', function () {
    $request = new App\External\Api\Request\ActionCenter\GenerateObligationRequestRequest;
    $validator = Validator::make([], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->keys())->toContain(
            'obligation_request_number',
            'responsibility_center',
            'account_code',
            'particulars',
            'mswdo_printed_name',
            'mswdo_position',
            'budget_officer_printed_name',
            'budget_officer_position',
        );
});

it('renders a DOMPDF document with the official labels and no remote assets', function () {
    $data = new ObligationRequestData(
        transactionNumber: 'REQ-2026-00001',
        municipalityName: 'Gasan',
        municipalityLogoDataUri: null,
        payee: 'Share Mae Rejano',
        address: 'Brgy. Bognuyan, Gasan, Marinduque',
        assistanceType: 'Medical Assistance',
        approvedAmount: 1000,
        obligationRequestNumber: '200-2026-08-',
        responsibilityCenter: '7611',
        accountCode: '5-02-99-080',
        particulars: "Payment for Medical Assistance\nRE: Aid/Assistance to Individual in Crisis\nSituation (AICS) CY 2026",
        mswdoPrintedName: 'Rebecca S. Bisnar',
        mswdoPosition: 'Social Welfare Officer III',
        budgetOfficerPrintedName: 'Edden M. Sager',
        budgetOfficerPosition: 'Municipal Budget Officer',
        office: null,
        fpp: null,
        generatedByUserName: 'Test Admin',
        generatedAt: CarbonImmutable::parse('2026-08-17'),
    );

    $html = view('documents.action_center.obligation_request', compact('data'))->render();
    $response = app(ObligationRequestPdf::class)->response($data);

    expect($html)->toContain(
        'OBLIGATION REQUEST',
        'Responsibility',
        'Account',
        'Supporting documents valid, proper and legal',
        'Existence of available appropriation',
    )->not->toContain('@vite', '<script', 'http://', 'https://')
        ->and($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('content-type'))->toBe('application/pdf')
        ->and($response->getContent())->toStartWith('%PDF');
});

/** @return array{municipal_id: string, request_id: string} */
function seedObligationRequestContext(
    ?array $metadata = null,
    string $status = 'approved',
): array {
    $municipalId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $now = now();

    DB::table('municipalities')->insert([
        'id' => $municipalId,
        'name' => 'Gasan',
        'slug' => 'gasan-4905-'.Str::lower(Str::random(4)),
        'municipal_code' => 'GAS-'.Str::upper(Str::random(4)),
        'is_active' => true,
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
        'approved_at' => '2026-08-16 10:00:00',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => 'Share Mae',
        'last_name' => 'Rejano',
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
