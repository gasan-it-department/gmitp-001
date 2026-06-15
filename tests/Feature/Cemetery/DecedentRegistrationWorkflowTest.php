<?php

use App\Core\Cemetery\Actions\Decedents\DeleteDecedentDocumentAction;
use App\Core\Cemetery\Actions\Decedents\GetDecedentReviewErrorsAction;
use App\Core\Cemetery\Actions\Decedents\ReviewDecedentCorrectionAction;
use App\Core\Cemetery\Actions\Decedents\StoreDecedentAction;
use App\Core\Cemetery\Actions\Decedents\StoreDecedentDocumentAction;
use App\Core\Cemetery\Actions\Decedents\UpdateDecedentAction;
use App\Core\Cemetery\Actions\Decedents\VerifyDecedentAction;
use App\Core\Cemetery\Actions\Decedents\VerifyDecedentDocumentAction;
use App\Core\Cemetery\Dto\Decedents\DecedentDto;
use App\Core\Cemetery\Enums\DocumentVerificationStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentCorrection;
use App\Core\Cemetery\Models\DecedentDocument;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->unsignedBigInteger('psgc_municipality_id')->nullable();
        $table->string('psgc_barangay_code', 20)->nullable();
        $table->string('street_name', 150)->nullable();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('memorial_name')->nullable();
        $table->string('gender')->nullable();
        $table->string('cause_of_death')->nullable();
        $table->string('death_certificate_no')->nullable();
        $table->string('registry_number')->nullable();
        $table->text('notes')->nullable();
        $table->string('decedent_type')->default('standard');
        $table->string('vital_record_type')->default('death');
        $table->string('identity_status')->default('identified');
        $table->string('registration_status')->default('draft');
        $table->boolean('has_legal_name')->default(true);
        $table->date('date_of_birth')->nullable();
        $table->date('date_of_death')->nullable();
        $table->date('date_of_registration');
        $table->string('place_of_death')->nullable();
        $table->timestamp('submitted_at')->nullable();
        $table->ulid('submitted_by')->nullable();
        $table->timestamp('verified_at')->nullable();
        $table->ulid('verified_by')->nullable();
        $table->unsignedInteger('version')->default(1);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_unidentified_details', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id')->unique();
        $table->string('reference_code');
        $table->string('case_reference');
        $table->string('found_location')->nullable();
        $table->date('date_found')->nullable();
        $table->string('reported_by')->nullable();
        $table->string('reporting_agency')->nullable();
        $table->string('estimated_age')->nullable();
        $table->string('estimated_sex')->nullable();
        $table->text('distinguishing_features')->nullable();
        $table->text('physical_description')->nullable();
        $table->boolean('requires_medico_legal')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_fetal_death_details', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id')->unique();
        $table->unsignedSmallInteger('gestational_age_weeks')->nullable();
        $table->unsignedInteger('fetal_weight_grams')->nullable();
        $table->string('mother_name')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_decedent_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->ulid('supersedes_id')->nullable();
        $table->string('type');
        $table->string('document_number')->nullable();
        $table->date('issued_at')->nullable();
        $table->text('notes')->nullable();
        $table->string('verification_status')->default('pending');
        $table->timestamp('verified_at')->nullable();
        $table->ulid('verified_by')->nullable();
        $table->text('verification_notes')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_decedent_corrections', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->unsignedInteger('base_version');
        $table->json('original_values');
        $table->json('proposed_changes');
        $table->text('reason');
        $table->string('status')->default('pending');
        $table->ulid('requested_by')->nullable();
        $table->ulid('reviewed_by')->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->text('review_notes')->nullable();
        $table->timestamp('applied_at')->nullable();
        $table->timestamps();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->ulid('model_id');
        $table->uuid('uuid')->nullable()->unique();
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
        $table->timestamps();
    });

    $this->reviewErrors = new GetDecedentReviewErrorsAction;
    $this->idGenerator = new class implements IdGeneratorInterface
    {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    };
    Storage::fake('local');
    activity()->disableLogging();
});

afterEach(function () {
    activity()->enableLogging();
    Schema::dropIfExists('media');
    Schema::dropIfExists('cemetery_decedent_corrections');
    Schema::dropIfExists('cemetery_decedent_documents');
    Schema::dropIfExists('cemetery_fetal_death_details');
    Schema::dropIfExists('cemetery_unidentified_details');
    Schema::dropIfExists('cemetery_decedents');
});

it('validates identified unnamed fetal and unidentified review paths', function () {
    $identified = testDecedent(['first_name' => null, 'registry_number' => 'REG-1']);
    expect($this->reviewErrors->execute($identified))->toHaveKey('name');

    $unnamed = testDecedent(['has_legal_name' => false, 'first_name' => null, 'last_name' => null, 'memorial_name' => null, 'registry_number' => 'REG-2']);
    expect($this->reviewErrors->execute($unnamed))->toHaveKey('memorial_name');

    $fetal = testDecedent(['vital_record_type' => 'fetal_death', 'registry_number' => 'FETAL-1']);
    expect($this->reviewErrors->execute($fetal))->toHaveKey('fetal_details');

    $unidentified = testDecedent(['identity_status' => 'unidentified', 'has_legal_name' => false, 'first_name' => null, 'last_name' => null, 'registry_number' => null, 'date_of_death' => null]);
    expect($this->reviewErrors->execute($unidentified))->toHaveKey('unidentified_details')
        ->not->toHaveKey('date_of_death');
});

it('requires complete fetal and unidentified details before review', function () {
    $fetal = testDecedent(['vital_record_type' => 'fetal_death', 'registry_number' => 'FETAL-2']);
    DB::table('cemetery_fetal_death_details')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $fetal->municipal_id,
        'decedent_id' => $fetal->id,
        'gestational_age_weeks' => 36,
        'fetal_weight_grams' => 2200,
        'mother_name' => 'MOTHER NAME',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    expect($this->reviewErrors->execute($fetal->fresh()))->not->toHaveKey('fetal_details');

    $unknown = testDecedent(['identity_status' => 'unidentified', 'has_legal_name' => false, 'first_name' => null, 'last_name' => null, 'registry_number' => null]);
    DB::table('cemetery_unidentified_details')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $unknown->municipal_id,
        'decedent_id' => $unknown->id,
        'reference_code' => 'UNID-1',
        'case_reference' => 'UNID-1',
        'found_location' => 'BARANGAY UNO',
        'date_found' => '2026-01-01',
        'reporting_agency' => 'PNP',
        'physical_description' => 'ADULT MALE, APPROXIMATELY 170 CM',
        'requires_medico_legal' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    expect($this->reviewErrors->execute($unknown->fresh()))->not->toHaveKey('unidentified_details');
});

it('blocks duplicate registry numbers only within the same municipality and vital record type', function () {
    $record = testDecedent(['municipal_id' => 'municipality-a', 'registry_number' => 'REG-100']);
    testDecedent(['municipal_id' => 'municipality-b', 'registry_number' => 'REG-100']);

    expect($this->reviewErrors->execute($record->fresh()))->not->toHaveKey('registry_number');

    testDecedent(['municipal_id' => 'municipality-a', 'registry_number' => 'REG-100']);
    expect($this->reviewErrors->execute($record->fresh()))->toHaveKey('registry_number');
});

it('fails closed when verification uses another municipality tenant', function () {
    $record = testDecedent(['municipal_id' => 'municipality-a', 'registration_status' => 'pending_review']);
    $action = new VerifyDecedentAction($this->reviewErrors);

    expect(fn () => $action->execute($record->id, 'municipality-b'))
        ->toThrow(ModelNotFoundException::class);
});

it('rejects a stale version without overwriting newer data', function () {
    $record = testDecedent(['first_name' => 'NEWER NAME', 'version' => 2, 'registration_status' => 'draft']);
    $idGenerator = new class implements IdGeneratorInterface
    {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    };
    $action = new UpdateDecedentAction($idGenerator);

    expect(fn () => $action->execute(testDto($record->municipal_id, 1), $record->id))
        ->toThrow(ValidationException::class, 'changed by another user');
    expect($record->fresh()->first_name)->toBe('NEWER NAME')
        ->and($record->fresh()->version)->toBe(2);
});

it('allows an incomplete fetal draft and keeps it out of review', function () {
    $dto = new DecedentDto(
        municipalId: 'municipality-a',
        vitalRecordType: 'fetal_death',
        identityStatus: 'identified',
        hasLegalName: false,
        submissionIntent: 'draft',
        version: null,
        firstName: null,
        lastName: null,
        middleName: null,
        suffix: null,
        memorialName: null,
        gender: 'INDETERMINATE',
        dateOfBirth: null,
        dateOfDeath: null,
        dateOfRegistration: '2026-01-02',
        registryNumber: null,
        causeOfDeath: null,
        placeOfDeath: null,
        notes: null,
        psgcMunicipalityId: null,
        psgcBarangayCode: null,
        streetName: null,
        unidentifiedDetails: [],
        fetalDetails: [],
        documents: [],
        avatar: null,
    );

    $record = (new StoreDecedentAction($this->idGenerator))->execute($dto);

    expect($record->registration_status->value)->toBe('draft')
        ->and($record->fetalDeathDetail)->not->toBeNull()
        ->and($record->fetalDeathDetail->mother_name)->toBeNull();
});

it('keeps a verified document active until its replacement is verified', function () {
    $record = testDecedent(['registration_status' => 'verified']);
    $store = new StoreDecedentDocumentAction($this->idGenerator);
    $verify = new VerifyDecedentDocumentAction;

    $original = $store->execute($record->id, $record->municipal_id, [
        'type' => 'death_certificate',
        'document_number' => 'CERT-1',
    ], fakePdf('death-certificate.pdf'));
    $verify->execute($original->id, $record->id, $record->municipal_id, true, null);

    $replacement = $store->execute($record->id, $record->municipal_id, [
        'type' => 'death_certificate',
        'document_number' => 'CERT-1-CORRECTED',
        'supersedes_document_id' => $original->id,
    ], fakePdf('corrected.pdf'));

    expect($original->fresh()->verification_status)->toBe(DocumentVerificationStatus::VERIFIED)
        ->and($replacement->verification_status)->toBe(DocumentVerificationStatus::PENDING)
        ->and($replacement->getFirstMedia('file')?->mime_type)->toBe('application/pdf');

    $verify->execute($replacement->id, $record->id, $record->municipal_id, true, 'Replacement checked');

    expect($original->fresh()->verification_status)->toBe(DocumentVerificationStatus::SUPERSEDED)
        ->and($replacement->fresh()->verification_status)->toBe(DocumentVerificationStatus::VERIFIED);
});

it('soft deletes pending documents but protects verified evidence', function () {
    $record = testDecedent(['registration_status' => 'verified']);
    $store = new StoreDecedentDocumentAction($this->idGenerator);
    $delete = new DeleteDecedentDocumentAction;
    $verify = new VerifyDecedentDocumentAction;

    $pending = $store->execute($record->id, $record->municipal_id, [
        'type' => 'burial_permit',
    ], fakePdf('permit.pdf'));
    $delete->execute($pending->id, $record->id, $record->municipal_id);
    expect(DecedentDocument::withTrashed()->findOrFail($pending->id)->trashed())->toBeTrue();

    $verified = $store->execute($record->id, $record->municipal_id, [
        'type' => 'death_certificate',
    ], fakePdf('certificate.pdf'));
    $verify->execute($verified->id, $record->id, $record->municipal_id, true, null);

    expect(fn () => $delete->execute($verified->id, $record->id, $record->municipal_id))
        ->toThrow(ValidationException::class, 'must be replaced');
});

it('resolves an unidentified record in place and preserves its original case details', function () {
    $record = testDecedent([
        'identity_status' => 'unidentified',
        'has_legal_name' => false,
        'first_name' => null,
        'last_name' => null,
        'registry_number' => null,
        'registration_status' => 'verified',
    ]);
    DB::table('cemetery_unidentified_details')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $record->municipal_id,
        'decedent_id' => $record->id,
        'reference_code' => 'UNID-PERMANENT',
        'case_reference' => 'UNID-PERMANENT',
        'found_location' => 'PUBLIC MARKET',
        'date_found' => '2026-01-01',
        'reporting_agency' => 'PNP',
        'physical_description' => 'IDENTIFYING DESCRIPTION',
        'requires_medico_legal' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $correction = correctionFor($record, [
        'identity_status' => 'identified',
        'has_legal_name' => true,
        'first_name' => 'GOKU',
        'last_name' => 'SON',
        'registry_number' => 'REG-GOKU',
    ]);

    (new ReviewDecedentCorrectionAction($this->reviewErrors))->execute(
        $correction->id,
        $record->id,
        $record->municipal_id,
        true,
        'Evidence confirmed',
    );

    $updated = $record->fresh('unidentifiedDetail');
    expect($updated->identity_status->value)->toBe('identified')
        ->and($updated->first_name)->toBe('GOKU')
        ->and($updated->unidentifiedDetail?->case_reference)->toBe('UNID-PERMANENT')
        ->and($updated->version)->toBe(2);
});

it('rejects approval of a correction proposed against a stale version', function () {
    $record = testDecedent(['registration_status' => 'verified', 'version' => 2]);
    $correction = correctionFor($record, ['first_name' => 'CHANGED'], 1);

    expect(fn () => (new ReviewDecedentCorrectionAction($this->reviewErrors))->execute(
        $correction->id,
        $record->id,
        $record->municipal_id,
        true,
        null,
    ))->toThrow(ValidationException::class, 'changed after this correction');
});

function testDecedent(array $overrides = []): Decedent
{
    $values = array_merge([
        'id' => (string) Str::ulid(),
        'municipal_id' => 'municipality-a',
        'first_name' => 'JUAN',
        'last_name' => 'DELA CRUZ',
        'vital_record_type' => 'death',
        'identity_status' => 'identified',
        'registration_status' => 'pending_review',
        'has_legal_name' => true,
        'date_of_birth' => '1980-01-01',
        'date_of_death' => '2026-01-01',
        'date_of_registration' => '2026-01-02',
        'registry_number' => 'REG-'.Str::random(8),
        'version' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides);

    DB::table('cemetery_decedents')->insert($values);

    return Decedent::query()->findOrFail($values['id']);
}

function testDto(string $municipalId, int $version): DecedentDto
{
    return new DecedentDto(
        municipalId: $municipalId,
        vitalRecordType: 'death',
        identityStatus: 'identified',
        hasLegalName: true,
        submissionIntent: 'draft',
        version: $version,
        firstName: 'STALE NAME',
        lastName: 'DELA CRUZ',
        middleName: null,
        suffix: null,
        memorialName: null,
        gender: 'MALE',
        dateOfBirth: '1980-01-01',
        dateOfDeath: '2026-01-01',
        dateOfRegistration: '2026-01-02',
        registryNumber: 'REG-STALE',
        causeOfDeath: null,
        placeOfDeath: null,
        notes: null,
        psgcMunicipalityId: null,
        psgcBarangayCode: null,
        streetName: null,
        unidentifiedDetails: [],
        fetalDetails: [],
        documents: [],
        avatar: null,
    );
}

function correctionFor(Decedent $decedent, array $changes, ?int $baseVersion = null): DecedentCorrection
{
    DB::table('cemetery_decedent_corrections')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $decedent->municipal_id,
        'decedent_id' => $decedent->id,
        'base_version' => $baseVersion ?? $decedent->version,
        'original_values' => json_encode([]),
        'proposed_changes' => json_encode($changes),
        'reason' => 'Correct the civil record',
        'status' => 'pending',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return DecedentCorrection::query()->findOrFail($id);
}

function fakePdf(string $name): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        $name,
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF"
    );
}
