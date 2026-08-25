<?php

use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptData;
use App\Core\ActionCenter\UseCase\Assistance\GenerateAcknowledgementReceiptAction;
use App\External\Documents\ActionCenter\Pdf\AcknowledgementReceiptPdf;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
        $table->text('description')->nullable();
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

it('builds trusted receipt form data from the frozen claimant snapshot', function () {
    $context = seedAcknowledgementReceiptContext(metadata: [
        'relationship_to_beneficiary' => 'parent',
        'on_behalf_first_name' => 'Juan',
        'on_behalf_last_name' => 'Rejano',
    ]);

    $data = app(GenerateAcknowledgementReceiptAction::class)->formData(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->recipientName)->toBe('Share Mae Rejano')
        ->and($data->barangay)->toBe('Bognuyan')
        ->and($data->assistanceType)->toBe('Medical Assistance')
        ->and($data->approvedAmount)->toBe(1000.0)
        ->and($data->submittedDate)->toBe('2026-08-14')
        ->and($data->providedDate)->toBeNull();
});

it('uses the actual release date only after physical release', function () {
    $context = seedAcknowledgementReceiptContext(
        status: 'released',
        releasedAt: '2026-08-17 00:00:00',
    );

    $data = app(GenerateAcknowledgementReceiptAction::class)->execute(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($data->submittedAt->format('Y-m-d'))->toBe('2026-08-14')
        ->and($data->providedAt?->format('Y-m-d'))->toBe('2026-08-17');

    $html = view('documents.action_center.acknowledgement_receipt', compact('data'))->render();

    expect(substr_count($html, 'August 17, 2026'))->toBe(2);
});

it('rejects ineligible, incomplete, and cross-municipality requests', function () {
    $action = app(GenerateAcknowledgementReceiptAction::class);
    $pending = seedAcknowledgementReceiptContext(status: 'pending');

    expect(fn() => $action->formData($pending['request_id'], $pending['municipal_id']))
        ->toThrow(DomainException::class);

    $approved = seedAcknowledgementReceiptContext();

    expect(fn() => $action->formData($approved['request_id'], (string) Str::ulid()))
        ->toThrow(AuthorizationException::class);

    $missingSnapshot = seedAcknowledgementReceiptContext();
    DB::table('ac_assistance_request_snapshots')
        ->where('assistance_request_id', $missingSnapshot['request_id'])
        ->delete();

    expect(fn() => $action->formData($missingSnapshot['request_id'], $missingSnapshot['municipal_id']))
        ->toThrow(DomainException::class);

    $missingAmount = seedAcknowledgementReceiptContext(amountApproved: null);

    expect(fn() => $action->formData($missingAmount['request_id'], $missingAmount['municipal_id']))
        ->toThrow(DomainException::class);
});

it('renders the official dompdf receipt without description or browser assets', function () {
    $data = new AcknowledgementReceiptData(
        transactionNumber: 'REQ-2026-00002',
        municipalityName: 'Gasan',
        municipalityLogoDataUri: null,
        recipientName: 'Share Mae Rejano',
        barangay: 'Bognuyan',
        approvedAmount: 1000,
        assistanceType: 'Medical Assistance',
        submittedAt: CarbonImmutable::parse('2026-08-14'),
        providedAt: null,
        generatedAt: CarbonImmutable::parse('2026-08-17'),
    );

    $html = view('documents.action_center.acknowledgement_receipt', compact('data'))->render();
    $response = app(AcknowledgementReceiptPdf::class)->response($data);

    expect($html)->toContain(
        'ACKNOWLEDGEMENT RECEIPT',
        'August 14, 2026',
        'Medical Assistance',
        'Received by:',
        'Name and Signature of Beneficiary',
    )->not->toContain(
            'Medical Assistance Assistance',
            'Released by:',
            'Draft for signature',
            'Reference pending',
            'This request was filed on behalf of',
            'Nais ko po makahinge ng tulong medical financial',
            'System Record',
            '@vite',
            '<script',
            'http://',
            'https://',
        )->and(substr_count($html, 'class="receipt-section"'))->toBe(2)
        ->and(substr_count($html, 'ACKNOWLEDGEMENT RECEIPT'))->toBe(2)
        ->and(substr_count($html, 'August 14, 2026'))->toBe(2)
        ->and(substr_count($html, 'Share Mae Rejano'))->toBe(4)
        ->and(substr_count($html, 'Php 1,000.00'))->toBe(2)
        ->and(substr_count($html, 'Medical Assistance'))->toBe(4)
        ->and(substr_count($html, 'Received by:'))->toBe(2)
        ->and(substr_count($html, 'Name and Signature of Beneficiary'))->toBe(2)
        ->and(substr_count($html, 'class="cut-line"'))->toBe(1)
        ->and(substr_count($html, 'class="line provided-line"'))->toBe(2)
        ->and($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('content-type'))->toBe('application/pdf')
        ->and($response->getContent())->toStartWith('%PDF');
});

it('does not write request or media records while generating', function () {
    $context = seedAcknowledgementReceiptContext();
    $beforeRequests = DB::table('ac_assistance_requests')->count();
    $beforeMedia = DB::table('media')->count();

    app(GenerateAcknowledgementReceiptAction::class)->execute(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect(DB::table('ac_assistance_requests')->count())->toBe($beforeRequests)
        ->and(DB::table('media')->count())->toBe($beforeMedia);
});

/** @return array{municipal_id: string, request_id: string} */
function seedAcknowledgementReceiptContext(
    ?array $metadata = null,
    string $status = 'approved',
    ?string $releasedAt = null,
    float|int|null $amountApproved = 1000,
): array {
    $municipalId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $submittedAt = '2026-08-14 09:30:00';

    DB::table('municipalities')->insert([
        'id' => $municipalId,
        'name' => 'Gasan',
        'slug' => 'gasan-4905-' . Str::lower(Str::random(4)),
        'municipal_code' => 'GAS-' . Str::upper(Str::random(4)),
        'is_active' => true,
        'created_at' => $submittedAt,
        'updated_at' => $submittedAt,
    ]);

    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'municipal_id' => $municipalId,
        'name' => 'Medical Assistance',
        'slug' => 'medical-assistance',
        'created_at' => $submittedAt,
        'updated_at' => $submittedAt,
    ]);

    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'beneficiary_id' => (string) Str::ulid(),
        'household_id' => (string) Str::ulid(),
        'assistance_type_id' => $assistanceTypeId,
        'transaction_number' => 'REQ-2026-' . Str::upper(Str::random(5)),
        'status' => $status,
        'amount_approved' => $amountApproved,
        'metadata' => $metadata ? json_encode($metadata, JSON_THROW_ON_ERROR) : null,
        'description' => 'Nais ko po makahinge ng tulong medical financial',
        'approved_at' => in_array($status, ['approved', 'released'], true) ? '2026-08-16 10:00:00' : null,
        'released_at' => $releasedAt,
        'created_at' => $submittedAt,
        'updated_at' => $submittedAt,
    ]);

    DB::table('ac_assistance_request_snapshots')->insert([
        'id' => (string) Str::ulid(),
        'assistance_request_id' => $requestId,
        'first_name' => 'Share Mae',
        'last_name' => 'Rejano',
        'street' => 'Purok 2',
        'barangay' => 'Bognuyan',
        'created_at' => $submittedAt,
        'updated_at' => $submittedAt,
    ]);

    return [
        'municipal_id' => $municipalId,
        'request_id' => $requestId,
    ];
}
