<?php

use App\Core\ActionCenter\Dto\Assistance\DisbursementVoucherData;
use App\Core\ActionCenter\Dto\Assistance\GenerateDisbursementVoucherDto;
use App\Core\ActionCenter\Services\PhilippinePesoInWordsFormatter;
use App\Core\ActionCenter\UseCase\Assistance\GenerateDisbursementVoucherAction;
use App\External\Documents\ActionCenter\Pdf\DisbursementVoucherPdf;
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

it('builds trusted voucher form data and spells the approved amount', function () {
    $context = seedDisbursementVoucherContext(amount: 1000.50);

    $data = app(GenerateDisbursementVoucherAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->payee)->toBe('Share Mae Rejano')
        ->and($data->address)->toBe('Purok 2, Brgy. Bognuyan, Gasan, Marinduque')
        ->and($data->approvedAmount)->toBe(1000.50)
        ->and($data->suggestedExplanation)->toContain('Payment for Medical Assistance')
        ->and($data->suggestedExplanation)->toContain('AICS) CY 2026')
        ->and($data->suggestedExplanation)->toContain('ONE THOUSAND PESOS AND 50/100 ONLY');
});

it('keeps the claimant as payee and mentions the assisted person', function () {
    $context = seedDisbursementVoucherContext(metadata: [
        'relationship_to_beneficiary' => 'parent',
        'on_behalf_first_name' => 'Juan',
        'on_behalf_last_name' => 'Rejano',
    ]);

    $data = app(GenerateDisbursementVoucherAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->payee)->toBe('Share Mae Rejano')
        ->and($data->suggestedExplanation)->toContain('For: Juan Rejano');
});

it('rejects ineligible status tenant mismatch and missing snapshots', function () {
    $action = app(GenerateDisbursementVoucherAction::class);
    $pending = seedDisbursementVoucherContext(status: 'pending');

    expect(fn () => $action->formData($pending['request_id'], $pending['municipal_id']))
        ->toThrow(DomainException::class);

    $approved = seedDisbursementVoucherContext();

    expect(fn () => $action->formData($approved['request_id'], (string) Str::ulid()))
        ->toThrow(AuthorizationException::class);

    DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $approved['request_id'])
        ->delete();

    expect(fn () => $action->formData($approved['request_id'], $approved['municipal_id']))
        ->toThrow(DomainException::class);
});

it('accepts optional voucher number and tin while validating manual fields', function () {
    $request = new App\External\Api\Request\ActionCenter\GenerateDisbursementVoucherRequest;
    $valid = [
        'mode_of_payment' => 'cash',
        'obligation_request_number' => '200-2026-08-',
        'responsibility_center_code' => '7611',
        'explanation' => 'Payment for Medical Assistance',
        'accountant_printed_name' => 'Jhea Mae R. Malapote',
        'accountant_position' => 'Municipal Accountant',
        'treasurer_printed_name' => 'Maria Jesusa M. Ghosh',
        'treasurer_position' => 'Municipal Treasurer',
        'mayor_printed_name' => 'Hon. Lidany A. Baldo',
        'mayor_position' => 'Municipal Mayor',
    ];

    expect(Validator::make($valid, $request->rules())->passes())->toBeTrue()
        ->and(Validator::make([...$valid, 'mode_of_payment' => 'crypto'], $request->rules())->fails())->toBeTrue();
});

it('uses trusted values and performs no database writes when preparing the voucher', function () {
    $context = seedDisbursementVoucherContext();
    $beforeRequests = DB::table('ac_assistance_requests')->count();
    $beforeMedia = DB::table('media')->count();
    $dto = new GenerateDisbursementVoucherDto(
        assistanceRequestId: $context['request_id'],
        municipalId: $context['municipal_id'],
        disbursementVoucherNumber: null,
        modeOfPayment: 'cash',
        tinEmployeeNumber: null,
        obligationRequestNumber: '200-2026-08-',
        responsibilityCenterOffice: null,
        responsibilityCenterCode: '7611',
        explanation: 'Payment for Medical Assistance',
        accountantPrintedName: 'Jhea Mae R. Malapote',
        accountantPosition: 'Municipal Accountant',
        treasurerPrintedName: 'Maria Jesusa M. Ghosh',
        treasurerPosition: 'Municipal Treasurer',
        mayorPrintedName: 'Hon. Lidany A. Baldo',
        mayorPosition: 'Municipal Mayor',
    );

    $data = app(GenerateDisbursementVoucherAction::class)->execute($dto, 'Test Admin');

    expect($data->payee)->toBe('Share Mae Rejano')
        ->and($data->approvedAmount)->toBe(1000.0)
        ->and($data->disbursementVoucherNumber)->toBeNull()
        ->and(DB::table('ac_assistance_requests')->count())->toBe($beforeRequests)
        ->and(DB::table('media')->count())->toBe($beforeMedia);
});

it('formats whole peso and centavo amounts consistently', function () {
    $formatter = app(PhilippinePesoInWordsFormatter::class);

    expect($formatter->format(1000))->toBe('ONE THOUSAND PESOS ONLY')
        ->and($formatter->format(2500.75))->toBe('TWO THOUSAND FIVE HUNDRED PESOS AND 75/100 ONLY');
});

it('renders the official voucher labels through dompdf without remote assets', function () {
    $data = new DisbursementVoucherData(
        transactionNumber: 'REQ-2026-00001',
        municipalityName: 'Gasan',
        municipalityLogoDataUri: null,
        payee: 'Share Mae Rejano',
        address: 'Brgy. Bognuyan, Gasan, Marinduque',
        assistanceType: 'Medical Assistance',
        approvedAmount: 1000,
        disbursementVoucherNumber: null,
        modeOfPayment: 'cash',
        tinEmployeeNumber: null,
        obligationRequestNumber: '200-2026-08-',
        responsibilityCenterOffice: 'MSWDO',
        responsibilityCenterCode: '7611',
        explanation: "Payment for Medical Assistance\nRE: Aid/Assistance to Individual in Crisis Situation (AICS) CY 2026\nONE THOUSAND PESOS ONLY",
        accountantPrintedName: 'Jhea Mae R. Malapote',
        accountantPosition: 'Municipal Accountant',
        treasurerPrintedName: 'Maria Jesusa M. Ghosh',
        treasurerPosition: 'Municipal Treasurer',
        mayorPrintedName: 'Hon. Lidany A. Baldo',
        mayorPosition: 'Municipal Mayor',
        generatedByUserName: 'Test Admin',
        generatedAt: CarbonImmutable::parse('2026-08-18'),
    );

    $html = view('documents.action_center.disbursement_voucher', compact('data'))->render();
    $response = app(DisbursementVoucherPdf::class)->response($data);

    expect($html)->toContain(
        'DISBURSEMENT VOUCHER',
        'Mode of',
        'Obligation Request No.',
        'Amount Due',
        'Allotment obligated for the purpose as indicated above',
        'Approved for Payment',
        'Received Payment',
        'JEV No.',
    )->not->toContain('@vite', '<script', 'http://', 'https://')
        ->and($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('content-type'))->toBe('application/pdf')
        ->and($response->getContent())->toStartWith('%PDF');
});

/** @return array{municipal_id: string, request_id: string} */
function seedDisbursementVoucherContext(
    ?array $metadata = null,
    string $status = 'approved',
    float $amount = 1000,
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
        'amount_approved' => $amount,
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
