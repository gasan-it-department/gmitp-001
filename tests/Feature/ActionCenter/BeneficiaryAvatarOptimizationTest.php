<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Beneficiary\UploadBeneficiaryAvatarAction;
use App\External\Documents\ActionCenter\ShowBeneficiaryAvatarController;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();
    Storage::fake('public');
    config()->set('media-library.disk_name', 'public');

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
        $table->string('middle_name')->nullable();
        $table->string('last_name');
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
});

afterEach(function () {
    activity()->enableLogging();

    foreach (['media', 'ac_beneficiaries', 'ac_households'] as $table) {
        Schema::dropIfExists($table);
    }
});

it('preserves the uploaded source and creates a square webp display conversion', function () {
    $beneficiary = avatarBeneficiary($this->municipalId);

    $result = app(UploadBeneficiaryAvatarAction::class)->execute(
        beneficiaryId: $beneficiary->id,
        photo: UploadedFile::fake()->image('portrait.jpg', 1600, 1000),
        municipalId: $this->municipalId,
    );

    $media = $result->getFirstMedia('avatar');
    $conversion = Beneficiary::AVATAR_DISPLAY_CONVERSION;

    expect($media)->not->toBeNull()
        ->and($media?->hasGeneratedConversion($conversion))->toBeTrue();

    Storage::disk('public')->assertExists($media->getPathRelativeToRoot());
    Storage::disk('public')->assertExists($media->getPathRelativeToRoot($conversion));

    [$sourceWidth, $sourceHeight] = getimagesize(Storage::disk('public')->path($media->getPathRelativeToRoot()));
    [$displayWidth, $displayHeight, $displayType] = getimagesize(
        Storage::disk('public')->path($media->getPathRelativeToRoot($conversion)),
    );

    expect([$sourceWidth, $sourceHeight])->toBe([1600, 1000])
        ->and([$displayWidth, $displayHeight])->toBe([512, 512])
        ->and(image_type_to_mime_type($displayType))->toBe('image/webp');
});

it('serves the private display conversion and replaces prior avatar media', function () {
    $beneficiary = avatarBeneficiary($this->municipalId);
    $action = app(UploadBeneficiaryAvatarAction::class);

    $action->execute(
        beneficiaryId: $beneficiary->id,
        photo: UploadedFile::fake()->image('first.jpg', 900, 1200),
        municipalId: $this->municipalId,
    );

    $result = $action->execute(
        beneficiaryId: $beneficiary->id,
        photo: UploadedFile::fake()->image('second.png', 1200, 900),
        municipalId: $this->municipalId,
    );

    $media = $result->getFirstMedia('avatar');
    $conversion = Beneficiary::AVATAR_DISPLAY_CONVERSION;
    app()->instance('municipal_id', $this->municipalId);

    $response = app(ShowBeneficiaryAvatarController::class)(
        'gasan',
        $beneficiary->id,
        Request::create('/avatar', 'GET'),
    );

    expect($result->getMedia('avatar'))->toHaveCount(1)
        ->and($media?->file_name)->toBe("avatar-{$beneficiary->id}.png")
        ->and($response->getStatusCode())->toBe(200)
        ->and($response->headers->get('Content-Type'))->toBe('image/webp')
        ->and($response->headers->get('Content-Length'))->toBe((string) Storage::disk('public')->size(
            $media->getPathRelativeToRoot($conversion),
        ))
        ->and($response->headers->get('Cache-Control'))->toContain('private')
        ->and($response->headers->get('Cache-Control'))->toContain('immutable');
});

it('does not serve an avatar across municipality tenants', function () {
    $beneficiary = avatarBeneficiary($this->municipalId);

    app(UploadBeneficiaryAvatarAction::class)->execute(
        beneficiaryId: $beneficiary->id,
        photo: UploadedFile::fake()->image('avatar.jpg', 800, 800),
        municipalId: $this->municipalId,
    );

    app()->instance('municipal_id', (string) Str::ulid());

    expect(fn () => app(ShowBeneficiaryAvatarController::class)(
        'other-municipality',
        $beneficiary->id,
        Request::create('/avatar', 'GET'),
    ))->toThrow(AuthorizationException::class);
});

function avatarBeneficiary(string $municipalId): Beneficiary
{
    $household = Household::create([
        'municipal_id' => $municipalId,
        'barangay' => 'POBLACION',
        'barangay_psgc_code' => '174003000',
        'street' => 'RIZAL',
    ]);

    return Beneficiary::create([
        'household_id' => $household->id,
        'municipal_id' => $municipalId,
        'first_name' => 'JUAN',
        'last_name' => 'CRUZ',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
    ]);
}
