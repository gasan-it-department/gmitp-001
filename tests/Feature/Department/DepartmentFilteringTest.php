<?php

use App\Core\Department\Actions\ListDepartmentsAction;
use App\Core\Department\Dto\DepartmentFiltersDto;
use App\Core\Department\Models\Department;
use App\External\Api\Request\Department\IndexDepartmentRequest;
use App\External\Web\Controllers\Department\IndexDepartmentController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Support\Header;

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

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->ulid('model_id');
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
});

afterEach(function () {
    Schema::dropIfExists('media');
    Schema::dropIfExists('departments');
});

it('searches department names and codes within the current municipality', function () {
    $engineering = filteredDepartment($this->gasan, [
        'name' => 'Municipal Engineering Office',
        'code' => 'MEO',
    ]);
    filteredDepartment($this->gasan, ['name' => 'Municipal Health Office', 'code' => 'MHO']);
    filteredDepartment($this->boac, ['name' => 'Engineering Office', 'code' => 'MEO']);

    $action = new ListDepartmentsAction;

    expect(departmentIds($action->execute(
        $this->gasan,
        DepartmentFiltersDto::fromArray(['search' => 'engineering']),
    )))->toBe([$engineering])
        ->and(departmentIds($action->execute(
            $this->gasan,
            DepartmentFiltersDto::fromArray(['search' => 'meo']),
        )))->toBe([$engineering]);
});

it('combines search and status filters', function () {
    $matching = filteredDepartment($this->gasan, [
        'name' => 'Office of the Municipal Assessor',
        'code' => 'OMA',
        'is_active' => false,
    ]);
    filteredDepartment($this->gasan, [
        'name' => 'Office of the Municipal Administrator',
        'code' => 'OMAD',
        'is_active' => true,
    ]);
    filteredDepartment($this->gasan, [
        'name' => 'Municipal Health Office',
        'code' => 'MHO',
        'is_active' => false,
    ]);

    $departments = (new ListDepartmentsAction)->execute(
        $this->gasan,
        DepartmentFiltersDto::fromArray([
            'search' => 'municipal a',
            'status' => 'inactive',
        ]),
    );

    expect(departmentIds($departments))->toBe([$matching]);
});

it('supports every sort mode with deterministic id tie breaking', function () {
    $alphaId = '01K00000000000000000000000';
    $zuluOlderId = '01K00000000000000000000001';
    $zuluNewerId = '01K00000000000000000000002';

    filteredDepartment($this->gasan, [
        'id' => $alphaId,
        'name' => 'Accounting Office',
        'created_at' => '2026-08-01 08:00:00',
    ]);
    filteredDepartment($this->gasan, [
        'id' => $zuluNewerId,
        'name' => 'Zoning Office',
        'created_at' => '2026-08-11 08:00:00',
    ]);
    filteredDepartment($this->gasan, [
        'id' => $zuluOlderId,
        'name' => 'Zoning Office',
        'created_at' => '2026-08-10 08:00:00',
    ]);

    $action = new ListDepartmentsAction;

    expect(departmentIds($action->execute($this->gasan, DepartmentFiltersDto::fromArray([]))))
        ->toBe([$alphaId, $zuluOlderId, $zuluNewerId])
        ->and(departmentIds($action->execute(
            $this->gasan,
            DepartmentFiltersDto::fromArray(['sort' => 'name_desc']),
        )))
        ->toBe([$zuluOlderId, $zuluNewerId, $alphaId])
        ->and(departmentIds($action->execute(
            $this->gasan,
            DepartmentFiltersDto::fromArray(['sort' => 'created_desc']),
        )))
        ->toBe([$zuluNewerId, $zuluOlderId, $alphaId]);
});

it('keeps active filters in pagination links', function () {
    foreach (range(1, 21) as $index) {
        filteredDepartment($this->gasan, [
            'name' => "Municipal Office {$index}",
            'code' => "MO{$index}",
        ]);
    }

    request()->query->replace(['search' => 'Municipal', 'status' => 'active']);
    $departments = (new ListDepartmentsAction)->execute(
        $this->gasan,
        DepartmentFiltersDto::fromArray(request()->query()),
    );

    expect($departments->total())->toBe(21)
        ->and($departments->url(2))->toContain('search=Municipal')
        ->and($departments->url(2))->toContain('status=active');
});

it('validates and normalizes department filter values', function () {
    $rules = (new IndexDepartmentRequest)->rules();

    expect(Validator::make(['status' => 'archived'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['sort' => 'code'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['page' => 0], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['search' => str_repeat('a', 256)], $rules)->fails())->toBeTrue()
        ->and(Validator::make([
            'search' => '  health  ',
            'status' => 'active',
            'sort' => 'name_desc',
            'page' => 2,
        ], $rules)->passes())->toBeTrue()
        ->and(DepartmentFiltersDto::fromArray(['search' => '  health  '])->search)->toBe('health');
});

it('returns normalized filters and options from the Inertia controller', function () {
    $request = IndexDepartmentRequest::create('/gasan-4905/department', 'GET', [
        'status' => 'inactive',
        'sort' => 'name_desc',
    ]);
    $request->headers->set(Header::INERTIA, 'true');
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->validateResolved();

    app()->instance('municipal_id', $this->gasan);

    $action = Mockery::mock(ListDepartmentsAction::class);
    $action->shouldReceive('execute')
        ->once()
        ->withArgs(fn (string $municipalId, DepartmentFiltersDto $filters) => $municipalId === $this->gasan
            && $filters->status === 'inactive'
            && $filters->sort === 'name_desc')
        ->andReturn(new LengthAwarePaginator([], 0, DepartmentFiltersDto::PER_PAGE));

    $response = (new IndexDepartmentController($action))($request)->toResponse($request);
    $page = $response->getData(true);

    expect($page['component'])->toBe('Department/Index')
        ->and($page['props']['filters']['status'])->toBe('inactive')
        ->and($page['props']['filters']['sort'])->toBe('name_desc')
        ->and(collect($page['props']['status_options'])->pluck('value')->all())->toBe(['active', 'inactive'])
        ->and(collect($page['props']['sort_options'])->pluck('value')->all())->toBe([
            'name_asc',
            'name_desc',
            'created_desc',
        ]);
});

it('stores department logos on the configured media disk', function () {
    config()->set('filesystems.disks.department_test', [
        'driver' => 'local',
        'root' => storage_path('framework/testing/disks/department_test'),
        'throw' => true,
    ]);
    config()->set('media-library.disk_name', 'department_test');
    Storage::fake('department_test');

    $id = filteredDepartment($this->gasan);
    $department = Department::query()->findOrFail($id);
    $logo = UploadedFile::fake()->createWithContent(
        'department-logo.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII='),
    );

    $media = $department
        ->addMedia($logo)
        ->toMediaCollection('department_logo');

    expect($media->disk)->toBe('department_test');
    Storage::disk('department_test')->assertExists($media->getPathRelativeToRoot());
});

function filteredDepartment(string $municipalId, array $overrides = []): string
{
    $createdAt = $overrides['created_at'] ?? '2026-08-01 08:00:00';
    $updatedAt = $overrides['updated_at'] ?? $createdAt;

    DB::table('departments')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => 'Municipal Engineering Office',
        'code' => 'MEO',
        'description' => null,
        'is_active' => true,
        'created_at' => $createdAt,
        'updated_at' => $updatedAt,
        'deleted_at' => null,
    ], $overrides));

    return $overrides['id'] ?? $id;
}

function departmentIds(LengthAwarePaginator $departments): array
{
    return collect($departments->items())->pluck('id')->all();
}
