<?php

use App\Core\Cemetery\Actions\Decedents\CorrectDecedentAction;
use App\Core\Cemetery\Actions\Decedents\DeleteDecedentDocumentAction;
use App\Core\Cemetery\Actions\Decedents\GetDecedentReviewErrorsAction;
use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Actions\Decedents\StoreDecedentAction;
use App\Core\Cemetery\Actions\Decedents\StoreDecedentDocumentAction;
use App\Core\Cemetery\Actions\Decedents\UpdateDecedentAction;
use App\Core\Cemetery\Actions\Decedents\VerifyDecedentAction;
use App\Core\Cemetery\Dto\Decedents\DecedentDto;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use App\External\Api\Controllers\Cemetery\Decedents\DownloadDecedentDocumentController;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\Models\Activity;

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

        $table->unique(['municipal_id', 'case_reference']);
    });

    Schema::create('cemetery_decedent_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->string('type');
        $table->string('document_number')->nullable();
        $table->date('issued_at')->nullable();
        $table->text('notes')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_interment_readiness_overrides', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->json('missing_requirements');
        $table->text('reason');
        $table->string('evidence_reference');
        $table->timestamp('expires_at');
        $table->timestamp('consumed_at')->nullable();
        $table->ulid('created_by')->nullable();
        $table->ulid('consumed_by')->nullable();
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

    Schema::create('activity_log', function (Blueprint $table) {
        $table->id();
        $table->string('log_name')->nullable()->index();
        $table->text('description');
        $table->nullableUlidMorphs('subject', 'subject');
        $table->string('event')->nullable();
        $table->nullableUlidMorphs('causer', 'causer');
        $table->json('attribute_changes')->nullable();
        $table->json('properties')->nullable();
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
    Schema::dropIfExists('activity_log');
    Schema::dropIfExists('media');
    Schema::dropIfExists('cemetery_interment_readiness_overrides');
    Schema::dropIfExists('cemetery_decedent_documents');
    Schema::dropIfExists('cemetery_unidentified_details');
    Schema::dropIfExists('cemetery_decedents');
});

it('validates identified, unnamed fetal, and unidentified review paths', function () {
    $identified = testDecedent(['first_name' => null, 'registry_number' => 'REG-1']);
    expect($this->reviewErrors->execute($identified))->toHaveKey('name');

    $unnamed = testDecedent(['has_legal_name' => false, 'first_name' => null, 'last_name' => null, 'memorial_name' => null, 'registry_number' => 'REG-2']);
    expect($this->reviewErrors->execute($unnamed))->toHaveKey('memorial_name');

    $fetal = testDecedent([
        'vital_record_type' => 'fetal_death',
        'has_legal_name' => false,
        'first_name' => null,
        'last_name' => null,
        'memorial_name' => 'BABY OF MARIA SANTOS',
        'registry_number' => 'FETAL-1',
    ]);
    expect($this->reviewErrors->execute($fetal))->toBeEmpty();

    $unidentified = testDecedent(['identity_status' => 'unidentified', 'has_legal_name' => false, 'first_name' => null, 'last_name' => null, 'registry_number' => null, 'date_of_death' => null]);
    expect($this->reviewErrors->execute($unidentified))->toHaveKey('unidentified_details')
        ->not->toHaveKey('date_of_death');
});

it('requires complete unidentified details before review', function () {
    $unknown = testDecedent(['identity_status' => 'unidentified', 'has_legal_name' => false, 'first_name' => null, 'last_name' => null, 'registry_number' => null]);
    DB::table('cemetery_unidentified_details')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $unknown->municipal_id,
        'decedent_id' => $unknown->id,
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

it('keeps unidentified case references unique within each municipality', function () {
    $first = testDecedent(['municipal_id' => 'municipality-a']);
    $otherMunicipality = testDecedent(['municipal_id' => 'municipality-b']);
    $duplicate = testDecedent(['municipal_id' => 'municipality-a']);

    $insertDetail = static fn (Decedent $decedent) => DB::table('cemetery_unidentified_details')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $decedent->municipal_id,
        'decedent_id' => $decedent->id,
        'case_reference' => 'UNID-SHARED',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $insertDetail($first);
    $insertDetail($otherMunicipality);

    expect(fn () => $insertDetail($duplicate))->toThrow(QueryException::class);
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
        avatar: null,
    );

    $record = (new StoreDecedentAction($this->idGenerator))->execute($dto);

    expect($record->registration_status->value)->toBe('draft')
        ->and($record->vital_record_type->value)->toBe('fetal_death')
        ->and(Schema::hasTable('cemetery_fetal_death_details'))->toBeFalse();
});

it('submits verifies and readies a fetal record without subtype details', function () {
    $dto = new DecedentDto(
        municipalId: 'municipality-a',
        vitalRecordType: 'fetal_death',
        identityStatus: 'identified',
        hasLegalName: false,
        submissionIntent: 'submit',
        version: null,
        firstName: null,
        lastName: null,
        middleName: null,
        suffix: null,
        memorialName: 'BABY OF MARIA SANTOS',
        gender: 'INDETERMINATE',
        dateOfBirth: null,
        dateOfDeath: '2026-01-01',
        dateOfRegistration: '2026-01-02',
        registryNumber: 'FETAL-100',
        causeOfDeath: null,
        placeOfDeath: null,
        notes: null,
        psgcMunicipalityId: null,
        psgcBarangayCode: null,
        streetName: null,
        unidentifiedDetails: [],
        avatar: null,
    );

    $record = (new StoreDecedentAction($this->idGenerator))->execute($dto);
    $verified = (new VerifyDecedentAction($this->reviewErrors))->execute($record->id, $record->municipal_id);
    $storeDocument = new StoreDecedentDocumentAction($this->idGenerator);
    $readiness = new GetIntermentReadinessAction;

    $initial = $readiness->execute($verified);
    expect($verified->registration_status->value)->toBe('verified')
        ->and($initial['missing'])->toContain('fetal_death_certificate', 'burial_permit')
        ->not->toContain('death_certificate');

    $storeDocument->execute($record->id, $record->municipal_id, [
        'type' => 'fetal_death_certificate',
        'document_number' => 'FETAL-100',
    ], fakePdf('fetal-death-certificate.pdf'));
    $storeDocument->execute($record->id, $record->municipal_id, [
        'type' => 'burial_permit',
        'document_number' => 'PERMIT-100',
    ], fakePdf('burial-permit.pdf'));

    expect($readiness->execute($record->fresh())['ready'])->toBeTrue();
});

it('counts uploaded documents toward interment readiness immediately', function () {
    $record = testDecedent(['registration_status' => 'verified']);
    $store = new StoreDecedentDocumentAction($this->idGenerator);
    $readiness = new GetIntermentReadinessAction;

    $certificate = $store->execute($record->id, $record->municipal_id, [
        'type' => 'death_certificate',
        'document_number' => 'CERT-1',
    ], fakePdf('death-certificate.pdf'));

    $blocked = $readiness->execute($record->fresh());
    expect($certificate->getFirstMedia('file')?->mime_type)->toBe('application/pdf')
        ->and($blocked['ready'])->toBeFalse()
        ->and($blocked['missing'])->toContain('burial_permit')
        ->not->toContain('death_certificate');

    $store->execute($record->id, $record->municipal_id, [
        'type' => 'burial_permit',
        'document_number' => 'PERMIT-1',
    ], fakePdf('burial-permit.pdf'));

    expect($readiness->execute($record->fresh())['ready'])->toBeTrue();
});

it('soft deletes documents while retaining their private media and audit event', function () {
    $record = testDecedent(['registration_status' => 'verified']);
    $store = new StoreDecedentDocumentAction($this->idGenerator);
    $delete = new DeleteDecedentDocumentAction;
    $readiness = new GetIntermentReadinessAction;

    $document = $store->execute($record->id, $record->municipal_id, [
        'type' => 'burial_permit',
    ], fakePdf('permit.pdf'));
    $media = $document->getFirstMedia('file');
    activity()->enableLogging();
    $delete->execute($document->id, $record->id, $record->municipal_id);
    activity()->disableLogging();

    $deleted = DecedentDocument::withTrashed()->findOrFail($document->id);
    $readinessResult = $readiness->execute($record->fresh());

    expect($deleted->trashed())->toBeTrue()
        ->and(DecedentDocument::query()->find($document->id))->toBeNull()
        ->and($media?->fresh())->not->toBeNull()
        ->and(Storage::disk('local')->exists($media?->getPathRelativeToRoot() ?? ''))->toBeTrue()
        ->and($readinessResult['missing'])->toContain('burial_permit')
        ->and(Activity::query()->where('event', 'deleted')->where('subject_id', $document->id)->exists())->toBeTrue();
});

it('fails closed when document operations use another municipality tenant', function () {
    $record = testDecedent(['municipal_id' => 'municipality-a']);
    $store = new StoreDecedentDocumentAction($this->idGenerator);
    $document = $store->execute($record->id, $record->municipal_id, [
        'type' => 'burial_permit',
    ], fakePdf('permit.pdf'));

    expect(fn () => $store->execute($record->id, 'municipality-b', [
        'type' => 'death_certificate',
    ], fakePdf('certificate.pdf')))->toThrow(ModelNotFoundException::class)
        ->and(fn () => (new DeleteDecedentDocumentAction)->execute(
            $document->id,
            $record->id,
            'municipality-b',
        ))->toThrow(ModelNotFoundException::class);
});

it('blocks cross-tenant and soft-deleted document downloads', function () {
    $record = testDecedent(['municipal_id' => 'municipality-a']);
    $document = (new StoreDecedentDocumentAction($this->idGenerator))->execute(
        $record->id,
        $record->municipal_id,
        ['type' => 'burial_permit'],
        fakePdf('permit.pdf'),
    );
    $download = new DownloadDecedentDocumentController;

    app()->instance('municipal_id', 'municipality-b');
    expect(fn () => $download('municipality-b', $record->id, $document->id))
        ->toThrow(ModelNotFoundException::class);

    app()->instance('municipal_id', 'municipality-a');
    (new DeleteDecedentDocumentAction)->execute($document->id, $record->id, $record->municipal_id);

    expect(fn () => $download('municipality-a', $record->id, $document->id))
        ->toThrow(ModelNotFoundException::class);
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
        'case_reference' => 'UNID-PERMANENT',
        'found_location' => 'PUBLIC MARKET',
        'date_found' => '2026-01-01',
        'reporting_agency' => 'PNP',
        'physical_description' => 'IDENTIFYING DESCRIPTION',
        'requires_medico_legal' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    (new CorrectDecedentAction($this->reviewErrors, $this->idGenerator))->execute(
        $record->id,
        $record->municipal_id,
        $record->version,
        [
            'identity_status' => 'identified',
            'has_legal_name' => true,
            'first_name' => 'Goku',
            'last_name' => 'Son',
            'registry_number' => 'REG-GOKU',
        ],
        'Identity evidence confirmed',
        fakePdf('identity-evidence.pdf'),
    );

    $updated = $record->fresh('unidentifiedDetail');
    expect($updated->identity_status->value)->toBe('identified')
        ->and($updated->first_name)->toBe('GOKU')
        ->and($updated->unidentifiedDetail?->case_reference)->toBe('UNID-PERMANENT')
        ->and($updated->version)->toBe(2);
});

it('rejects a correction proposed against a stale version', function () {
    $record = testDecedent(['registration_status' => 'verified', 'version' => 2]);

    expect(fn () => (new CorrectDecedentAction($this->reviewErrors, $this->idGenerator))->execute(
        $record->id,
        $record->municipal_id,
        1,
        ['first_name' => 'CHANGED'],
        'Correct the name',
        fakePdf('evidence.pdf'),
    ))->toThrow(ValidationException::class, 'changed by another user');
});

it('rejects direct correction of a record that is not verified', function () {
    $record = testDecedent(['registration_status' => 'pending_review']);

    expect(fn () => (new CorrectDecedentAction($this->reviewErrors, $this->idGenerator))->execute(
        $record->id,
        $record->municipal_id,
        $record->version,
        ['first_name' => 'CHANGED'],
        'Correct the name',
        fakePdf('evidence.pdf'),
    ))->toThrow(ValidationException::class, 'Only verified records');
});

it('rejects a correction that does not change the record', function () {
    $record = testDecedent(['registration_status' => 'verified']);

    expect(fn () => (new CorrectDecedentAction($this->reviewErrors, $this->idGenerator))->execute(
        $record->id,
        $record->municipal_id,
        $record->version,
        ['first_name' => 'Juan'],
        'No actual change',
        fakePdf('evidence.pdf'),
    ))->toThrow(ValidationException::class, 'at least one changed value');
});

it('applies an authorized correction immediately with evidence and an audit event', function () {
    $record = testDecedent(['registration_status' => 'verified']);
    activity()->enableLogging();

    $updated = (new CorrectDecedentAction($this->reviewErrors, $this->idGenerator))->execute(
        $record->id,
        $record->municipal_id,
        $record->version,
        ['first_name' => 'Pedro', 'cause_of_death' => 'Natural causes'],
        'Matched the corrected civil record',
        fakePdf('civil-record.pdf'),
    );
    activity()->disableLogging();

    $media = $updated->getFirstMedia('correction_evidence');
    $audit = Activity::query()->where('event', 'corrected')->firstOrFail();

    expect($updated->first_name)->toBe('PEDRO')
        ->and($updated->cause_of_death)->toBe('NATURAL CAUSES')
        ->and($updated->version)->toBe(2)
        ->and($media)->not->toBeNull()
        ->and($media?->getCustomProperty('reason'))->toBe('Matched the corrected civil record')
        ->and($audit->subject_id)->toBe($record->id)
        ->and($audit->properties->get('evidence_media_id'))->toBe($media?->id)
        ->and($audit->attribute_changes->get('old')['first_name'])->toBe('JUAN')
        ->and($audit->attribute_changes->get('attributes')['first_name'])->toBe('PEDRO');
});

it('fails closed when a correction uses another municipality tenant', function () {
    $record = testDecedent(['municipal_id' => 'municipality-a', 'registration_status' => 'verified']);

    expect(fn () => (new CorrectDecedentAction($this->reviewErrors, $this->idGenerator))->execute(
        $record->id,
        'municipality-b',
        $record->version,
        ['first_name' => 'CHANGED'],
        'Correct the name',
        fakePdf('evidence.pdf'),
    ))->toThrow(ModelNotFoundException::class);
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
        avatar: null,
    );
}

function fakePdf(string $name): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        $name,
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF"
    );
}
