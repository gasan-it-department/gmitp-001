<?php

use App\Core\CommunityReport\Actions\GetAdminReportSubmissionsAction;
use App\Core\CommunityReport\Dto\AdminReportFiltersDto;
use App\External\Api\Request\CommunityReport\Admin\IndexReportRequest;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name');
        $table->string('last_name');
        $table->timestamps();
    });

    Schema::create('report_submissions', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->index();
        $table->ulid('user_id')->nullable()->index();
        $table->string('category', 32);
        $table->string('status', 32)->default('pending')->index();
        $table->string('location_text');
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 11, 8)->nullable();
        $table->text('description');
        $table->boolean('is_anonymous')->default(false);
        $table->timestamp('acknowledged_at')->nullable();
        $table->timestamp('in_progress_at')->nullable();
        $table->timestamp('resolved_at')->nullable();
        $table->timestamp('rejected_at')->nullable();
        $table->ulid('acknowledged_by')->nullable()->index();
        $table->ulid('in_progress_by')->nullable()->index();
        $table->ulid('resolved_by')->nullable()->index();
        $table->ulid('rejected_by')->nullable()->index();
        $table->string('assigned_to')->nullable();
        $table->text('acknowledgement_note')->nullable();
        $table->text('resolution_note')->nullable();
        $table->string('rejection_reason', 500)->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    $this->gasan = (string) Str::ulid();
    $this->boac = (string) Str::ulid();
    $this->reporter = communityReportUser('Grace', 'Santos');
});

afterEach(function () {
    Schema::dropIfExists('report_submissions');
    Schema::dropIfExists('users');
});

it('keeps admin report results scoped to the current municipality', function () {
    $gasanReport = communityReport($this->gasan, $this->reporter, [
        'location_text' => 'Gasan plaza',
    ]);
    communityReport($this->boac, $this->reporter, [
        'location_text' => 'Boac plaza',
    ]);

    $reports = (new GetAdminReportSubmissionsAction)
        ->execute($this->gasan, AdminReportFiltersDto::fromArray([]));

    expect($reports->items())->toHaveCount(1)
        ->and($reports->items()[0]->id)->toBe($gasanReport);
});

it('filters admin reports by status and category', function () {
    $matching = communityReport($this->gasan, $this->reporter, [
        'status' => 'pending',
        'category' => 'garbage',
    ]);
    communityReport($this->gasan, $this->reporter, [
        'status' => 'resolved',
        'category' => 'garbage',
    ]);
    communityReport($this->gasan, $this->reporter, [
        'status' => 'pending',
        'category' => 'streetlight',
    ]);

    $reports = (new GetAdminReportSubmissionsAction)
        ->execute($this->gasan, AdminReportFiltersDto::fromArray([
            'status' => 'pending',
            'category' => 'garbage',
        ]));

    expect($reports->items())->toHaveCount(1)
        ->and($reports->items()[0]->id)->toBe($matching);
});

it('filters admin reports by public visibility', function () {
    $anonymous = communityReport($this->gasan, $this->reporter, [
        'is_anonymous' => true,
    ]);
    $identified = communityReport($this->gasan, $this->reporter, [
        'is_anonymous' => false,
    ]);

    $anonymousReports = (new GetAdminReportSubmissionsAction)
        ->execute($this->gasan, AdminReportFiltersDto::fromArray(['visibility' => 'anonymous']));
    $identifiedReports = (new GetAdminReportSubmissionsAction)
        ->execute($this->gasan, AdminReportFiltersDto::fromArray(['visibility' => 'identified']));

    expect($anonymousReports->items())->toHaveCount(1)
        ->and($anonymousReports->items()[0]->id)->toBe($anonymous)
        ->and($identifiedReports->items())->toHaveCount(1)
        ->and($identifiedReports->items()[0]->id)->toBe($identified);
});

it('filters admin reports by submitted date range and oldest sort', function () {
    communityReport($this->gasan, $this->reporter, [
        'created_at' => '2026-05-01 08:00:00',
    ]);
    $middle = communityReport($this->gasan, $this->reporter, [
        'created_at' => '2026-05-10 08:00:00',
    ]);
    $newest = communityReport($this->gasan, $this->reporter, [
        'created_at' => '2026-05-20 08:00:00',
    ]);

    $reports = (new GetAdminReportSubmissionsAction)
        ->execute($this->gasan, AdminReportFiltersDto::fromArray([
            'date_from' => '2026-05-05',
            'date_to' => '2026-05-20',
            'sort' => 'oldest',
        ]));

    expect(collect($reports->items())->pluck('id')->all())->toBe([$middle, $newest]);
});

it('searches admin reports by location description and reporter name', function () {
    $locationMatch = communityReport($this->gasan, $this->reporter, [
        'location_text' => 'Town plaza entrance',
        'description' => 'Broken pavement',
    ]);
    $descriptionMatch = communityReport($this->gasan, $this->reporter, [
        'location_text' => 'Market road',
        'description' => 'Drainage water is overflowing',
    ]);
    $nameReporter = communityReportUser('Maria', 'Reyes');
    $reporterMatch = communityReport($this->gasan, $nameReporter, [
        'location_text' => 'Harbor street',
        'description' => 'Streetlight issue',
    ]);

    $action = new GetAdminReportSubmissionsAction;

    expect(collect($action->execute($this->gasan, AdminReportFiltersDto::fromArray(['search' => 'plaza']))->items())->pluck('id')->all())
        ->toBe([$locationMatch])
        ->and(collect($action->execute($this->gasan, AdminReportFiltersDto::fromArray(['search' => 'overflowing']))->items())->pluck('id')->all())
        ->toBe([$descriptionMatch])
        ->and(collect($action->execute($this->gasan, AdminReportFiltersDto::fromArray(['search' => 'Maria']))->items())->pluck('id')->all())
        ->toBe([$reporterMatch]);
});

it('validates admin report filter query values', function () {
    $rules = (new IndexReportRequest)->rules();

    expect(Validator::make(['status' => 'not-a-status'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['date_from' => '2026-05-10', 'date_to' => '2026-05-01'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['per_page' => 15], $rules)->fails())->toBeTrue()
        ->and(Validator::make([
            'status' => 'pending',
            'category' => 'garbage',
            'visibility' => 'anonymous',
            'date_from' => '2026-05-01',
            'date_to' => '2026-05-10',
            'sort' => 'oldest',
            'per_page' => 50,
        ], $rules)->passes())->toBeTrue();
});

function communityReportUser(string $firstName, string $lastName): string
{
    DB::table('users')->insert([
        'id' => $id = (string) Str::ulid(),
        'first_name' => $firstName,
        'last_name' => $lastName,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function communityReport(string $municipalId, ?string $userId, array $overrides = []): string
{
    $createdAt = $overrides['created_at'] ?? now();

    DB::table('report_submissions')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'user_id' => $userId,
        'category' => 'pothole',
        'status' => 'pending',
        'location_text' => 'Main road',
        'latitude' => null,
        'longitude' => null,
        'description' => 'Road damage needs attention.',
        'is_anonymous' => false,
        'acknowledged_at' => null,
        'in_progress_at' => null,
        'resolved_at' => null,
        'rejected_at' => null,
        'acknowledged_by' => null,
        'in_progress_by' => null,
        'resolved_by' => null,
        'rejected_by' => null,
        'assigned_to' => null,
        'acknowledgement_note' => null,
        'resolution_note' => null,
        'rejection_reason' => null,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
        'deleted_at' => null,
    ], $overrides));

    return $id;
}
