<?php

use App\Core\Feedback\Actions\ListFeedbackSubmissionsAction;
use App\Core\Feedback\Dto\AdminFeedbackFiltersDto;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\External\Api\Request\Feedback\Admin\IndexFeedbackRequest;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('departments', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->text('description')->nullable();
        $table->ulid('municipal_id')->index();
        $table->string('code');
        $table->boolean('is_active')->default(true);
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('feedback_submissions', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->index();
        $table->ulid('department_id')->nullable()->index();
        $table->ulid('user_id')->nullable();
        $table->string('citizen_name')->nullable();
        $table->text('contact_number')->nullable();
        $table->text('email')->nullable();
        $table->string('employee_name')->nullable();
        $table->string('subject');
        $table->text('message');
        $table->unsignedTinyInteger('rating')->nullable();
        $table->boolean('is_anonymous')->default(false);
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

    $this->gasan = (string) Str::ulid();
    $this->boac = (string) Str::ulid();
    $this->engineering = feedbackDepartment($this->gasan, 'Municipal Engineering Office', 'MEO');
    $this->health = feedbackDepartment($this->gasan, 'Municipal Health Office', 'MHO');
    $this->otherMunicipalityDepartment = feedbackDepartment($this->boac, 'Boac Engineering Office', 'BEO');
});

afterEach(function () {
    request()->query->replace([]);
    AbstractPaginator::queryStringResolver(fn () => []);
    Schema::dropIfExists('media');
    Schema::dropIfExists('feedback_submissions');
    Schema::dropIfExists('departments');
});

it('keeps admin feedback results scoped to the current municipality', function () {
    $matching = feedbackSubmission($this->gasan, ['department_id' => $this->engineering]);
    feedbackSubmission($this->boac, ['department_id' => $this->otherMunicipalityDepartment]);

    $feedbacks = (new ListFeedbackSubmissionsAction)
        ->execute(AdminFeedbackFiltersDto::fromArray([]), $this->gasan);

    expect($feedbacks->items())->toHaveCount(1)
        ->and($feedbacks->items()[0]->id)->toBe($matching);
});

it('searches by subject message employee name and department name', function () {
    $subjectMatch = feedbackSubmission($this->gasan, [
        'subject' => 'commendation',
        'message' => 'Helpful staff.',
        'employee_name' => 'Ana Cruz',
        'department_id' => $this->engineering,
    ]);
    $messageMatch = feedbackSubmission($this->gasan, [
        'subject' => 'complaint',
        'message' => 'The drainage request was delayed.',
        'employee_name' => 'Ben Santos',
        'department_id' => $this->engineering,
    ]);
    $employeeMatch = feedbackSubmission($this->gasan, [
        'subject' => 'suggestion',
        'message' => 'Please improve the queue.',
        'employee_name' => 'Carla Reyes',
        'department_id' => $this->engineering,
    ]);
    $departmentMatch = feedbackSubmission($this->gasan, [
        'subject' => 'inquiry',
        'message' => 'Clinic hours question.',
        'employee_name' => null,
        'department_id' => $this->health,
    ]);

    $action = new ListFeedbackSubmissionsAction;

    expect(ids($action->execute(AdminFeedbackFiltersDto::fromArray(['search' => 'commendation']), $this->gasan)))->toBe([$subjectMatch])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray(['search' => 'drainage']), $this->gasan)))->toBe([$messageMatch])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray(['search' => 'Carla']), $this->gasan)))->toBe([$employeeMatch])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray(['search' => 'Health']), $this->gasan)))->toBe([$departmentMatch]);
});

it('filters by department subject rating visibility and target', function () {
    $matching = feedbackSubmission($this->gasan, [
        'department_id' => $this->engineering,
        'subject' => 'complaint',
        'rating' => 2,
        'is_anonymous' => true,
        'employee_name' => 'Pedro Ramos',
    ]);
    feedbackSubmission($this->gasan, [
        'department_id' => $this->engineering,
        'subject' => 'complaint',
        'rating' => 5,
        'is_anonymous' => true,
        'employee_name' => 'Pedro Ramos',
    ]);
    feedbackSubmission($this->gasan, [
        'department_id' => $this->health,
        'subject' => 'complaint',
        'rating' => 2,
        'is_anonymous' => true,
        'employee_name' => 'Pedro Ramos',
    ]);

    $feedbacks = (new ListFeedbackSubmissionsAction)->execute(AdminFeedbackFiltersDto::fromArray([
        'department_id' => $this->engineering,
        'subject' => 'complaint',
        'rating' => 2,
        'visibility' => 'anonymous',
        'target' => 'employee',
    ]), $this->gasan);

    expect(ids($feedbacks))->toBe([$matching]);
});

it('filters department only unassigned and attachment state', function () {
    $withAttachment = feedbackSubmission($this->gasan, [
        'department_id' => $this->engineering,
        'employee_name' => null,
    ]);
    attachPhoto($withAttachment);
    $withoutAttachment = feedbackSubmission($this->gasan, [
        'department_id' => $this->engineering,
        'employee_name' => null,
    ]);
    $unassigned = feedbackSubmission($this->gasan, [
        'department_id' => null,
        'employee_name' => null,
    ]);

    $action = new ListFeedbackSubmissionsAction;

    expect(ids($action->execute(AdminFeedbackFiltersDto::fromArray([
        'target' => 'department',
        'has_attachments' => 'yes',
    ]), $this->gasan)))->toBe([$withAttachment])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray([
            'target' => 'department',
            'has_attachments' => 'no',
        ]), $this->gasan)))->toBe([$withoutAttachment])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray(['target' => 'unassigned']), $this->gasan)))->toBe([$unassigned]);
});

it('filters by date range and sorts oldest newest and rating', function () {
    $low = feedbackSubmission($this->gasan, [
        'rating' => 1,
        'created_at' => '2026-05-10 08:00:00',
    ]);
    $high = feedbackSubmission($this->gasan, [
        'rating' => 5,
        'created_at' => '2026-05-11 08:00:00',
    ]);
    feedbackSubmission($this->gasan, [
        'rating' => 3,
        'created_at' => '2026-05-01 08:00:00',
    ]);

    $action = new ListFeedbackSubmissionsAction;

    expect(ids($action->execute(AdminFeedbackFiltersDto::fromArray([
        'date_from' => '2026-05-10',
        'date_to' => '2026-05-11',
        'sort' => 'oldest',
    ]), $this->gasan)))->toBe([$low, $high])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray([
            'date_from' => '2026-05-10',
            'date_to' => '2026-05-11',
            'sort' => 'newest',
        ]), $this->gasan)))->toBe([$high, $low])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray([
            'date_from' => '2026-05-10',
            'date_to' => '2026-05-11',
            'sort' => 'rating_high',
        ]), $this->gasan)))->toBe([$high, $low])
        ->and(ids($action->execute(AdminFeedbackFiltersDto::fromArray([
            'date_from' => '2026-05-10',
            'date_to' => '2026-05-11',
            'sort' => 'rating_low',
        ]), $this->gasan)))->toBe([$low, $high]);
});

it('preserves query strings on pagination links', function () {
    AbstractPaginator::queryStringResolver(fn () => ['rating' => 5, 'per_page' => 10]);

    foreach (range(1, 11) as $day) {
        feedbackSubmission($this->gasan, [
            'rating' => 5,
            'created_at' => sprintf('2026-05-%02d 08:00:00', $day),
        ]);
    }

    $feedbacks = (new ListFeedbackSubmissionsAction)->execute(AdminFeedbackFiltersDto::fromArray([
        'rating' => 5,
        'per_page' => 10,
    ]), $this->gasan);

    expect(str_contains($feedbacks->nextPageUrl(), 'rating=5'))->toBeTrue()
        ->and(str_contains($feedbacks->nextPageUrl(), 'per_page=10'))->toBeTrue();
});

it('validates admin feedback filter query values', function () {
    $rules = (new IndexFeedbackRequest)->rules();

    expect(Validator::make(['subject' => 'not-a-type'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['rating' => 6], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['visibility' => 'public'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['target' => 'person'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['has_attachments' => 'maybe'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['date_from' => '2026-05-10', 'date_to' => '2026-05-01'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['per_page' => 15], $rules)->fails())->toBeTrue()
        ->and(Validator::make([
            'search' => 'service',
            'department_id' => $this->engineering,
            'subject' => 'complaint',
            'rating' => 3,
            'visibility' => 'identified',
            'target' => 'department',
            'has_attachments' => 'yes',
            'date_from' => '2026-05-01',
            'date_to' => '2026-05-10',
            'sort' => 'rating_low',
            'per_page' => 50,
        ], $rules)->passes())->toBeTrue();
});

function feedbackDepartment(string $municipalId, string $name, string $code): string
{
    DB::table('departments')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => $name,
        'description' => null,
        'code' => $code,
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
        'deleted_at' => null,
    ]);

    return $id;
}

function feedbackSubmission(string $municipalId, array $overrides = []): string
{
    $createdAt = $overrides['created_at'] ?? now();

    DB::table('feedback_submissions')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'department_id' => null,
        'user_id' => null,
        'citizen_name' => 'Juan Dela Cruz',
        'contact_number' => null,
        'email' => null,
        'employee_name' => null,
        'subject' => 'suggestion',
        'message' => 'Please improve the service.',
        'rating' => 3,
        'is_anonymous' => false,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
        'deleted_at' => null,
    ], $overrides));

    return $id;
}

function attachPhoto(string $feedbackId): void
{
    DB::table('media')->insert([
        'model_type' => (new FeedbackSubmission)->getMorphClass(),
        'model_id' => $feedbackId,
        'uuid' => (string) Str::uuid(),
        'collection_name' => 'attachments',
        'name' => 'photo',
        'file_name' => 'photo.jpg',
        'mime_type' => 'image/jpeg',
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

function ids(\Illuminate\Contracts\Pagination\LengthAwarePaginator $feedbacks): array
{
    return collect($feedbacks->items())->pluck('id')->all();
}
