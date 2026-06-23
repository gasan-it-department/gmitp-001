<?php

use App\Core\Cemetery\Actions\Decedents\DeleteDraftDecedentAction;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use App\Core\Cemetery\Models\UnidentifiedDetail;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
        $table->string('vital_record_type')->default('death');
        $table->string('identity_status')->default('identified');
        $table->string('registration_status')->default('draft');
        $table->boolean('has_legal_name')->default(true);
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
        $table->boolean('requires_medico_legal')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_fetal_death_details', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id')->unique();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_decedent_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->string('type');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_interments', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('decedent_id');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_interment_readiness_overrides', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('decedent_id');
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

    Storage::fake('local');
    activity()->disableLogging();
});

afterEach(function () {
    activity()->enableLogging();
    Schema::dropIfExists('activity_log');
    Schema::dropIfExists('media');
    Schema::dropIfExists('cemetery_interment_readiness_overrides');
    Schema::dropIfExists('cemetery_interments');
    Schema::dropIfExists('cemetery_decedent_documents');
    Schema::dropIfExists('cemetery_fetal_death_details');
    Schema::dropIfExists('cemetery_unidentified_details');
    Schema::dropIfExists('cemetery_decedents');
});

it('soft deletes a draft and its related records while retaining media and an audit reason', function () {
    $decedent = deletionTestDecedent();
    $detail = UnidentifiedDetail::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $decedent->municipal_id,
        'decedent_id' => $decedent->id,
        'reference_code' => 'UNID-DRAFT-1',
        'case_reference' => 'UNID-DRAFT-1',
    ]);
    $document = DecedentDocument::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $decedent->municipal_id,
        'decedent_id' => $decedent->id,
        'type' => 'police_report',
    ]);
    $document->addMedia(UploadedFile::fake()->createWithContent(
        'police-report.pdf',
        "%PDF-1.4\n%%EOF",
    ))->toMediaCollection('file', 'local');
    $media = $document->getFirstMedia('file');

    activity()->enableLogging();
    (new DeleteDraftDecedentAction)->execute(
        $decedent->id,
        $decedent->municipal_id,
        'Duplicate draft entered by mistake',
    );
    activity()->disableLogging();

    $audit = Activity::query()->where('event', 'draft_deleted')->firstOrFail();

    expect(Decedent::withTrashed()->findOrFail($decedent->id)->trashed())->toBeTrue()
        ->and(UnidentifiedDetail::withTrashed()->findOrFail($detail->id)->trashed())->toBeTrue()
        ->and(DecedentDocument::withTrashed()->findOrFail($document->id)->trashed())->toBeTrue()
        ->and($media?->fresh())->not->toBeNull()
        ->and(Storage::disk('local')->exists($media?->getPathRelativeToRoot() ?? ''))->toBeTrue()
        ->and($audit->properties->get('reason'))->toBe('Duplicate draft entered by mistake')
        ->and($audit->properties->get('document_ids'))->toBe([$document->id]);
});

it('rejects deletion of submitted or verified Decedent records', function (string $status) {
    $decedent = deletionTestDecedent($status);

    expect(fn () => (new DeleteDraftDecedentAction)->execute(
        $decedent->id,
        $decedent->municipal_id,
        'Should not be deleted',
    ))->toThrow(ValidationException::class, 'Only draft Decedent records');
})->with(['pending_review', 'verified']);

it('fails closed for another municipality and for drafts with operational records', function () {
    $decedent = deletionTestDecedent();

    expect(fn () => (new DeleteDraftDecedentAction)->execute(
        $decedent->id,
        'municipality-b',
        'Wrong tenant',
    ))->toThrow(ModelNotFoundException::class);

    DB::table('cemetery_interments')->insert([
        'id' => (string) Str::ulid(),
        'decedent_id' => $decedent->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => (new DeleteDraftDecedentAction)->execute(
        $decedent->id,
        $decedent->municipal_id,
        'Has an interment',
    ))->toThrow(ValidationException::class, 'operational records');
});

function deletionTestDecedent(string $status = 'draft'): Decedent
{
    DB::table('cemetery_decedents')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => 'municipality-a',
        'vital_record_type' => 'death',
        'identity_status' => 'unidentified',
        'registration_status' => $status,
        'has_legal_name' => false,
        'version' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return Decedent::query()->findOrFail($id);
}
