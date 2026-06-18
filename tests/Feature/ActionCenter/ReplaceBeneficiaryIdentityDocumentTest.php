<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Beneficiary\ReplaceBeneficiaryIdentityDocumentAction;
use App\External\Api\Request\ActionCenter\Beneficiary\ReplaceBeneficiaryIdentityDocumentRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();
    Storage::fake('public');

    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name')->nullable();
        $table->string('municipal_code')->nullable();
    });

    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('email')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->string('barangay');
        $table->string('barangay_psgc_code')->nullable();
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
        $table->ulid('identity_verified_by_user_id')->nullable();
        $table->timestamp('intake_rejected_at')->nullable();
        $table->ulid('intake_rejected_by_user_id')->nullable();
        $table->string('intake_rejection_reason', 1000)->nullable();
        $table->string('beneficiary_number')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date');
        $table->ulid('religion_id')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->string('contact_phone', 20)->nullable();
        $table->timestamp('terms_consented_at')->nullable();
        $table->string('terms_version')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->ulidMorphs('model');
        $table->uuid()->nullable()->unique();
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
        $table->unsignedInteger('order_column')->nullable()->index();
        $table->nullableTimestamps();
    });

    $this->municipalId = (string) Str::ulid();
    $this->otherMunicipalId = (string) Str::ulid();
    $this->adminId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        ['id' => $this->municipalId, 'name' => 'Gasan', 'municipal_code' => '174003'],
        ['id' => $this->otherMunicipalId, 'name' => 'Other', 'municipal_code' => '174004'],
    ]);

    DB::table('users')->insert([
        'id' => $this->adminId,
        'first_name' => 'Admin',
        'last_name' => 'Reviewer',
        'email' => 'admin@example.test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'media',
        'ac_beneficiaries',
        'ac_households',
        'users',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('replaces one identity document side without changing verification state', function () {
    $beneficiary = replacementDocumentBeneficiary($this->municipalId, [
        'identity_verified_at' => now(),
        'identity_verified_by_user_id' => $this->adminId,
        'intake_rejected_at' => now(),
        'intake_rejected_by_user_id' => $this->adminId,
        'intake_rejection_reason' => 'Old rejection note stays untouched.',
    ]);
    $verifiedAt = $beneficiary->identity_verified_at?->toIso8601String();

    $beneficiary
        ->addMedia(UploadedFile::fake()->image('old-front.jpg'))
        ->toMediaCollection('identity_id_front');

    $result = app(ReplaceBeneficiaryIdentityDocumentAction::class)->execute(
        beneficiaryId: $beneficiary->id,
        side: 'front',
        document: UploadedFile::fake()->image('new-front.jpg'),
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        reason: 'Clearer copy uploaded.',
    );

    expect($result->getMedia('identity_id_front'))->toHaveCount(1)
        ->and($result->getFirstMedia('identity_id_front')?->file_name)->toBe('identity-id-front-' . $beneficiary->id . '.jpg')
        ->and($result->identity_verified_at?->toIso8601String())->toBe($verifiedAt)
        ->and($result->identity_verified_by_user_id)->toBe($this->adminId)
        ->and($result->intake_rejected_at)->not->toBeNull()
        ->and($result->intake_rejection_reason)->toBe('Old rejection note stays untouched.');
});

it('tenant guards identity document replacement', function () {
    $beneficiary = replacementDocumentBeneficiary($this->otherMunicipalId);

    expect(fn () => app(ReplaceBeneficiaryIdentityDocumentAction::class)->execute(
        beneficiaryId: $beneficiary->id,
        side: 'back',
        document: UploadedFile::fake()->image('back.png'),
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
    ))->toThrow(AuthorizationException::class);
});

it('requires a reason only when replacing a verified beneficiary document', function () {
    $pending = replacementDocumentBeneficiary($this->municipalId);
    $verified = replacementDocumentBeneficiary($this->municipalId, [
        'identity_verified_at' => now(),
        'identity_verified_by_user_id' => $this->adminId,
    ]);

    $pendingRequest = replacementDocumentRequest($pending->id, [
        'document' => UploadedFile::fake()->image('pending-front.jpg'),
    ]);
    $verifiedRequest = replacementDocumentRequest($verified->id, [
        'document' => UploadedFile::fake()->image('verified-front.jpg'),
    ]);
    $verifiedWithReasonRequest = replacementDocumentRequest($verified->id, [
        'document' => UploadedFile::fake()->image('verified-front.jpg'),
        'reason' => 'The old copy was unreadable.',
    ]);

    expect(Validator::make($pendingRequest->all(), $pendingRequest->rules())->passes())->toBeTrue()
        ->and(Validator::make($verifiedRequest->all(), $verifiedRequest->rules())->errors()->has('reason'))->toBeTrue()
        ->and(Validator::make($verifiedWithReasonRequest->all(), $verifiedWithReasonRequest->rules())->passes())->toBeTrue();
});

function replacementDocumentBeneficiary(string $municipalId, array $overrides = []): Beneficiary
{
    $household = Household::create([
        'municipal_id' => $municipalId,
        'barangay' => 'POBLACION',
        'barangay_psgc_code' => '174003000',
        'street' => 'RIZAL',
    ]);

    return Beneficiary::create(array_merge([
        'household_id' => $household->id,
        'municipal_id' => $municipalId,
        'first_name' => 'JUAN',
        'last_name' => 'CRUZ',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'educational_attainment' => 'hs_grad',
        'civil_status' => 'single',
        'occupation' => 'NONE',
        'monthly_income' => 0,
        'terms_consented_at' => now(),
        'terms_version' => 'v1.0',
    ], $overrides));
}

function replacementDocumentRequest(string $beneficiaryId, array $payload): ReplaceBeneficiaryIdentityDocumentRequest
{
    $files = array_filter([
        'document' => $payload['document'] ?? null,
    ]);

    unset($payload['document']);

    $request = ReplaceBeneficiaryIdentityDocumentRequest::create(
        "/api/action-center/beneficiary/{$beneficiaryId}/identity-document/front",
        'POST',
        $payload,
        [],
        $files,
    );

    $route = new RoutingRoute('POST', '/api/action-center/beneficiary/{beneficiaryId}/identity-document/{side}', []);
    $route->bind($request);
    $route->setParameter('beneficiaryId', $beneficiaryId);
    $route->setParameter('side', 'front');

    $request->setRouteResolver(fn () => $route);
    $request->setContainer(app());

    return $request;
}
