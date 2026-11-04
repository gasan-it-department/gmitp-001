<?php

use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceDisbursementReferenceService;
use App\Core\ActionCenter\UseCase\Assistance\FindAssistanceDisbursementReferencesAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(function () {
    goodsInventoryFixture($this);
    activity()->disableLogging();
    $this->actor->givePermissionTo(['action_center.access', 'action_center.requests.view', 'action_center.requests.disburse']);
    Schema::create('ac_assistance_requests', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('municipal_id');
        $t->string('transaction_number');
        $t->string('status');
        $t->json('metadata')->nullable();
        $t->timestamps();
        $t->softDeletes();
    });
    Schema::create('ac_assistance_disbursements', function (Blueprint $t) {
        $t->ulid('id')->primary();
        $t->ulid('municipal_id');
        $t->ulid('assistance_request_id');
        $t->unsignedInteger('attempt_number')->default(1);
        $t->string('method');
        $t->string('status');
        $t->decimal('amount', 10, 2);
        $t->string('payee_name');
        $t->string('instrument_reference_number');
        $t->date('instrument_date');
        $t->timestamps();
    });
    $this->record = AssistanceRequest::create(['municipal_id' => $this->municipalId, 'transaction_number' => 'REQ-CURRENT', 'status' => 'approved']);
    $this->other = AssistanceRequest::create(['municipal_id' => $this->municipalId, 'transaction_number' => 'REQ-OTHER', 'status' => 'approved']);
    $this->foreign = AssistanceRequest::create(['municipal_id' => $this->otherMunicipalId, 'transaction_number' => 'REQ-FOREIGN', 'status' => 'approved']);
});

afterEach(function () {
    Schema::dropIfExists('ac_assistance_disbursements');
    Schema::dropIfExists('ac_assistance_requests');
    activity()->enableLogging();
    goodsInventoryCleanup();
});

function referenceAttempt(AssistanceRequest $request, string $status = 'preparing', string $method = 'check', string $reference = '00012-Ab'): AssistanceDisbursement
{
    return AssistanceDisbursement::create(['municipal_id' => $request->municipal_id, 'assistance_request_id' => $request->id,
        'status' => $status, 'method' => $method, 'amount' => '1500.00', 'payee_name' => 'Historical Payee',
        'instrument_reference_number' => $reference, 'instrument_date' => '2026-11-01']);
}

it('matches the save guard exactly and excludes only the editable preparing attempt', function (string $status) {
    referenceAttempt($this->record);
    $match = referenceAttempt($this->other, $status);
    referenceAttempt($this->foreign);
    referenceAttempt($this->other, 'voided', 'cash');
    referenceAttempt($this->other, 'voided', 'check', '00012-ab');
    $result = app(FindAssistanceDisbursementReferencesAction::class)->execute($this->record->id, $this->municipalId, 'check', ' 00012-Ab ');
    expect($result['matches']->total())->toBe(1)->and($result['matches']->first()->id)->toBe($match->id)
        ->and($result['blocking'])->toBe($status !== 'voided');
    $service = app(AssistanceDisbursementReferenceService::class);
    expect($service->blocking($service->matches($this->municipalId, 'check', '00012-Ab', $this->record->disbursements->first()->id))->exists())
        ->toBe($result['blocking']);
})->with(['preparing', 'ready', 'released', 'voided']);

it('shows blocking state across pages and never excludes ready or historical current-request attempts', function () {
    referenceAttempt($this->record, 'ready');
    for ($i = 0; $i < 11; $i++) {
        referenceAttempt($this->other, 'voided');
    }
    $action = app(FindAssistanceDisbursementReferencesAction::class);
    $result = $action->execute($this->record->id, $this->municipalId, 'check', '00012-Ab', 2);
    expect($result['blocking'])->toBeTrue()->and($result['matches']->total())->toBe(12)
        ->and($result['matches']->items())->toHaveCount(2);
    expect(fn () => $action->execute($this->foreign->id, $this->municipalId, 'check', '00012-Ab'))
        ->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});

it('returns minimal read-only matches and enforces both endpoint capabilities', function () {
    $this->withoutMiddleware([\App\Http\Middleware\Municipality\SetMunicipalityContext::class, \App\Http\Middleware\Admin\AdminGuardMiddleware::class, \App\Http\Middleware\HandleInertiaRequests::class]);
    $this->actingAs($this->actor);
    referenceAttempt($this->other);
    $url = '/api/action-center/assistance-request/'.$this->record->id.'/disbursement/reference-matches';
    $query = '?'.http_build_query(['method' => 'check', 'reference' => '00012-Ab']);
    $before = DB::table('ac_assistance_disbursements')->get()->toJson();
    $this->getJson($url.$query, ['X-Municipality-Slug' => 'inventory-test'])
        ->assertOk()->assertJsonPath('blocking', true)->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.transaction_number', 'REQ-OTHER')->assertJsonPath('data.0.payee_name', 'Historical Payee')
        ->assertJsonMissingPath('data.0.metadata')->assertJsonMissingPath('data.0.receiver_id_last_four');
    $this->getJson($url.'?method=other&reference=x&page=0')->assertUnprocessable()->assertJsonValidationErrors(['method', 'page']);
    foreach (['action_center.requests.view', 'action_center.requests.disburse'] as $permission) {
        $this->actor->revokePermissionTo($permission);
        $this->getJson($url.$query)->assertForbidden();
        $this->actor->givePermissionTo($permission);
    }
    $this->getJson(str_replace($this->record->id, $this->foreign->id, $url).$query)->assertNotFound();
    expect(DB::table('ac_assistance_disbursements')->get()->toJson())->toBe($before);
});
