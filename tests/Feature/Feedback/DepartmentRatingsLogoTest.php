<?php

use App\Core\Department\Models\Department;
use App\Core\Feedback\Actions\ListDepartmentRatingsAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

beforeEach(function () {
    Schema::create('departments', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->index();
        $table->string('name');
        $table->string('code');
        $table->text('description')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('feedback_submissions', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->index();
        $table->ulid('department_id')->nullable()->index();
        $table->unsignedTinyInteger('rating')->nullable();
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
});

afterEach(function () {
    Schema::dropIfExists('media');
    Schema::dropIfExists('feedback_submissions');
    Schema::dropIfExists('departments');
});

it('includes each department logo URL in the public ratings payload', function () {
    $municipalId = (string) Str::ulid();
    $withLogoId = ratingsLogoDepartment($municipalId, 'Municipal Engineering Office', 'MEO');
    $withoutLogoId = ratingsLogoDepartment($municipalId, 'Municipal Health Office', 'MHO');
    $mediaId = ratingsLogoMedia($withLogoId);

    $result = (new ListDepartmentRatingsAction)->execute($municipalId);
    $withLogo = $result['departments']->firstWhere('id', $withLogoId);
    $withoutLogo = $result['departments']->firstWhere('id', $withoutLogoId);

    expect($withLogo['logo_url'])->toBe(Media::query()->findOrFail($mediaId)->getUrl())
        ->and($withoutLogo['logo_url'])->toBeNull();
});

function ratingsLogoDepartment(string $municipalId, string $name, string $code): string
{
    DB::table('departments')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => $name,
        'code' => $code,
        'description' => null,
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => null,
    ]);

    return $id;
}

function ratingsLogoMedia(string $departmentId): int
{
    return DB::table('media')->insertGetId([
        'model_type' => (new Department)->getMorphClass(),
        'model_id' => $departmentId,
        'uuid' => (string) Str::uuid(),
        'collection_name' => 'department_logo',
        'name' => 'department-logo',
        'file_name' => 'department-logo.png',
        'mime_type' => 'image/png',
        'disk' => 'public',
        'conversions_disk' => 'public',
        'size' => 1024,
        'manipulations' => json_encode([]),
        'custom_properties' => json_encode([]),
        'generated_conversions' => json_encode([]),
        'responsive_images' => json_encode([]),
        'order_column' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}
