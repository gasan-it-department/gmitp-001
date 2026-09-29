<?php

use App\Core\Department\Models\Department;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->municipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Gasan',
        'slug' => 'gasan-4905',
        'municipal_code' => '4905',
        'is_active' => true,
    ]);
    $this->otherMunicipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Boac',
        'slug' => 'boac-4900',
        'municipal_code' => '4900',
        'is_active' => true,
    ]);
    $this->department = qrDepartment($this->municipality, 'Municipal Health Office', 'MHO');
    $this->otherDepartment = qrDepartment($this->municipality, 'Municipal Engineering Office', 'MEO');
});

it('shows the selected office and its logo on the QR feedback page', function () {
    $media = qrLogo($this->department, 'department_logo');

    $this->get(qrCreateUrl($this->municipality, $this->department))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Feedback/Client/Create/DepartmentFeedbackPage')
            ->where('department.id', $this->department->id)
            ->where('department.name', 'Municipal Health Office')
            ->where('department.logo_url', $media->getUrl())
            ->where('municipality_logo_url', null)
            ->where('is_eligible', true)
            ->has('feedbackTypes', 4)
            ->etc());
});

it('provides the municipality logo when the office has none', function () {
    $media = qrLogo($this->municipality, 'logo');

    $this->get(qrCreateUrl($this->municipality, $this->department))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Feedback/Client/Create/DepartmentFeedbackPage')
            ->where('department.logo_url', null)
            ->where('municipality_logo_url', $media->getUrl())
            ->etc());
});

it('rejects invalid inactive deleted and cross-municipality office links and posts', function () {
    $this->withoutMiddleware(ThrottleRequests::class);
    $inactive = qrDepartment($this->municipality, 'Inactive Office', 'INACTIVE');
    $inactive->update(['is_active' => false]);
    $deleted = qrDepartment($this->municipality, 'Deleted Office', 'DELETED');
    $deleted->delete();
    $crossTenant = qrDepartment($this->otherMunicipality, 'Boac Office', 'BOAC');

    foreach ([(string) Str::ulid(), $inactive->id, $deleted->id, $crossTenant->id] as $id) {
        $this->get(route('feedback.department.create', [
            'municipality' => $this->municipality->slug,
            'department' => $id,
        ]))->assertNotFound();

        $this->post(route('feedback.department.store', [
            'municipality' => $this->municipality->slug,
            'department' => $id,
        ]), qrPayload($id))->assertNotFound();
    }

    $this->assertDatabaseCount('feedback_submissions', 0);
});

it('requires an explicit rating and refuses a different submitted department', function () {
    $url = qrStoreUrl($this->municipality, $this->department);

    $this->from(qrCreateUrl($this->municipality, $this->department))
        ->post($url, qrPayload($this->department->id, ['rating' => null]))
        ->assertRedirect()
        ->assertSessionHasErrors('rating');

    $this->post($url, qrPayload($this->otherDepartment->id))
        ->assertRedirect()
        ->assertSessionHasErrors('department_id');

    $this->assertDatabaseCount('feedback_submissions', 0);
});

it('requires guest CAPTCHA and submits valid feedback to the fixed office', function () {
    $url = qrStoreUrl($this->municipality, $this->department);

    $this->post($url, qrPayload($this->department->id, ['captcha_token' => '']))
        ->assertSessionHasErrors('captcha_token');

    $this->post($url, qrPayload($this->department->id, [
        'employee_name' => 'Ana Santos',
        'rating' => 4,
    ]))->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseHas('feedback_submissions', [
        'municipal_id' => $this->municipality->id,
        'department_id' => $this->department->id,
        'employee_name' => 'Ana Santos',
        'rating' => 4,
        'is_anonymous' => true,
    ]);
});

it('accepts optional photo evidence on the QR route', function () {
    Storage::fake('public');

    $this->post(qrStoreUrl($this->municipality, $this->department), qrPayload($this->department->id, [
        'attachments' => [UploadedFile::fake()->image('service.jpg')],
    ]))->assertRedirect()->assertSessionHas('success');

    $feedback = FeedbackSubmission::query()->firstOrFail();
    expect($feedback->getMedia('attachments'))->toHaveCount(1);
});

it('honors the signed-in daily submission limit on the QR page', function () {
    $user = User::factory()->create(['municipal_id' => $this->municipality->id]);
    foreach (range(1, 3) as $index) {
        FeedbackSubmission::query()->create([
            'id' => (string) Str::ulid(),
            'municipal_id' => $this->municipality->id,
            'department_id' => $this->department->id,
            'user_id' => $user->id,
            'subject' => 'suggestion',
            'message' => "Earlier feedback {$index}",
            'rating' => 3,
            'is_anonymous' => true,
        ]);
    }

    $this->actingAs($user)
        ->get(qrCreateUrl($this->municipality, $this->department))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Feedback/Client/Create/DepartmentFeedbackPage')
            ->where('is_eligible', false)
            ->etc());

    $this->post(qrStoreUrl($this->municipality, $this->department), qrPayload($this->department->id, [
        'captcha_token' => '',
    ]))->assertRedirect()->assertSessionHasErrors('feedback');

    $this->assertDatabaseCount('feedback_submissions', 3);
});

it('keeps the regular public form and its existing submission route available', function () {
    $this->get(route('feedback.create', ['municipality' => $this->municipality->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Feedback/Client/Create/GiveFeedback')
            ->has('departments', 2)
            ->etc());

    $this->withHeader('X-Municipality-Slug', $this->municipality->slug)
        ->post(route('api.feedback.store'), qrPayload($this->department->id, ['rating' => null]))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('feedback_submissions', [
        'municipal_id' => $this->municipality->id,
        'department_id' => $this->department->id,
        'rating' => null,
    ]);

    $crossTenant = qrDepartment($this->otherMunicipality, 'Boac Office', 'BOAC');
    $this->withHeader('X-Municipality-Slug', $this->municipality->slug)
        ->post(route('api.feedback.store'), qrPayload($crossTenant->id))
        ->assertSessionHasErrors('department_id');

    $this->assertDatabaseCount('feedback_submissions', 1);
});

function qrDepartment(Municipality $municipality, string $name, string $code): Department
{
    return Department::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipality->id,
        'name' => $name,
        'code' => $code,
        'is_active' => true,
    ]);
}

function qrCreateUrl(Municipality $municipality, Department $department): string
{
    return route('feedback.department.create', [
        'municipality' => $municipality->slug,
        'department' => $department->id,
    ]);
}

function qrStoreUrl(Municipality $municipality, Department $department): string
{
    return route('feedback.department.store', [
        'municipality' => $municipality->slug,
        'department' => $department->id,
    ]);
}

function qrPayload(string $departmentId, array $overrides = []): array
{
    return array_merge([
        'department_id' => $departmentId,
        'subject' => 'commendation',
        'message' => 'The service was helpful.',
        'rating' => 5,
        'captcha_token' => 'test-captcha-token',
    ], $overrides);
}

function qrLogo(Department|Municipality $model, string $collection): Media
{
    $id = DB::table('media')->insertGetId([
        'model_type' => $model->getMorphClass(),
        'model_id' => $model->id,
        'uuid' => (string) Str::uuid(),
        'collection_name' => $collection,
        'name' => 'logo',
        'file_name' => 'logo.png',
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

    return Media::query()->findOrFail($id);
}
