<?php

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\UseCase\Assistance\ResolveFinancialDocumentPacketDocumentsAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->json('enabled_generated_documents')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('assistance_type_id');
        $table->timestamps();
        $table->softDeletes();
    });
});

afterEach(function () {
    Schema::dropIfExists('ac_assistance_requests');
    Schema::dropIfExists('ac_assistance_types');
});

it('resolves only enabled processing documents in their official packet order', function () {
    $context = seedFinancialPacketSelection([
        AssistanceGeneratedDocument::DisbursementVoucher->value,
        AssistanceGeneratedDocument::CertificateOfEligibility->value,
    ]);

    $documents = app(ResolveFinancialDocumentPacketDocumentsAction::class)->execute(
        $context['request_id'],
        $context['municipal_id'],
    );

    expect($documents)->toBe([
        AssistanceGeneratedDocument::CertificateOfEligibility,
        AssistanceGeneratedDocument::DisbursementVoucher,
    ]);
});

it('rejects packets with fewer than two enabled processing documents', function () {
    $context = seedFinancialPacketSelection([
        AssistanceGeneratedDocument::ObligationRequest->value,
        AssistanceGeneratedDocument::AcknowledgementReceipt->value,
    ]);

    expect(fn () => app(ResolveFinancialDocumentPacketDocumentsAction::class)->execute(
        $context['request_id'],
        $context['municipal_id'],
    ))->toThrow(DomainException::class, 'Enable at least two processing documents');
});

it('retains all three packet documents for legacy null settings and enforces tenancy', function () {
    $context = seedFinancialPacketSelection(null);
    $action = app(ResolveFinancialDocumentPacketDocumentsAction::class);

    expect($action->execute($context['request_id'], $context['municipal_id']))
        ->toBe(AssistanceGeneratedDocument::financialPacketCases())
        ->and(fn () => $action->execute($context['request_id'], (string) Str::ulid()))
        ->toThrow(AuthorizationException::class);
});

/** @return array{municipal_id: string, request_id: string} */
function seedFinancialPacketSelection(?array $enabledDocuments): array
{
    $municipalId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $requestId = (string) Str::ulid();
    $now = now();

    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'municipal_id' => $municipalId,
        'name' => 'Medical Assistance',
        'slug' => 'medical',
        'enabled_generated_documents' => $enabledDocuments === null
            ? null
            : json_encode($enabledDocuments, JSON_THROW_ON_ERROR),
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_requests')->insert([
        'id' => $requestId,
        'municipal_id' => $municipalId,
        'assistance_type_id' => $assistanceTypeId,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return [
        'municipal_id' => $municipalId,
        'request_id' => $requestId,
    ];
}
