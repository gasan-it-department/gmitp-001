<?php

use App\Shared\Aga\Contracts\AgaNotificationClientInterface;
use App\Shared\Aga\Dto\AgaNotificationDto;
use App\Shared\Aga\Dto\AgaNotificationResultDto;
use App\Shared\Aga\Exceptions\AgaNotificationException;
use App\Shared\Aga\Jobs\SendAgaNotificationJob;
use App\Shared\Aga\Services\AgaNotificationClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.aga_notifications' => [
        'enabled' => true,
        'url' => 'https://aga-notifications.example.test/send',
        'secret' => 'fake-notification-test-secret',
        'schema' => 'test',
        'timeout' => 10,
    ]]);
    Http::preventStrayRequests();
});

function agaNotificationTestResult(array $overrides = []): array
{
    return array_replace(['ok' => true, 'schema' => 'test', 'audience' => 'all', 'devices' => 2, 'sent' => 2,
        'failed' => 0, 'invalidTokens' => [], 'errors' => []], $overrides);
}

function agaNotificationTestPayload(): AgaNotificationDto
{
    return new AgaNotificationDto('Test update', 'A test status has changed.', 'order_status');
}

it('resolves the shared client through dependency injection and sends the documented request', function () {
    Http::fake(['*' => Http::response(agaNotificationTestResult())]);
    $client = app(AgaNotificationClientInterface::class);
    expect($client)->toBeInstanceOf(AgaNotificationClient::class);
    $result = $client->send(agaNotificationTestPayload());
    expect($result->successful())->toBeTrue()->and($result->sent)->toBe(2);
    Http::assertSent(fn (Request $request) => $request->url() === 'https://aga-notifications.example.test/send'
        && $request->method() === 'POST'
        && $request->hasHeader('x-external-notification-secret', 'fake-notification-test-secret')
        && ! $request->hasHeader('Authorization')
        && $request->hasHeader('Content-Type', 'application/json')
        && $request->data() === ['schema' => 'test', 'audience' => 'all', 'event_type' => 'order_status',
            'title' => 'Test update', 'message' => 'A test status has changed.']);
    Http::assertSentCount(1);
});

it('supports specific Supabase users and an optional HTTPS image', function () {
    $id = '872cee0c-d75b-457b-834f-3d68ae3b3a02';
    Http::fake(['*' => Http::response(agaNotificationTestResult(['audience' => 'specific']))]);
    app(AgaNotificationClientInterface::class)->send(new AgaNotificationDto(
        'Test update', 'Message.', 'order_status', 'specific', [$id, $id], 'https://example.test/image.jpg',
    ));
    Http::assertSent(fn (Request $request) => $request['user_ids'] === [$id] && $request['image_url'] === 'https://example.test/image.jpg');
});

it('blocks disabled or incomplete configurations before any HTTP request', function () {
    Http::fake();
    config(['services.aga_notifications.enabled' => false]);
    expect(fn () => app(AgaNotificationClientInterface::class)->send(agaNotificationTestPayload()))->toThrow(AgaNotificationException::class);
    config(['services.aga_notifications.enabled' => true, 'services.aga_notifications.secret' => '']);
    expect(fn () => app(AgaNotificationClientInterface::class)->send(agaNotificationTestPayload()))->toThrow(AgaNotificationException::class);
    config(['services.aga_notifications.secret' => 'fake', 'services.aga_notifications.url' => 'http://example.test/send']);
    expect(fn () => app(AgaNotificationClientInterface::class)->send(agaNotificationTestPayload()))->toThrow(AgaNotificationException::class);
    Http::assertNothingSent();
});

it('does not turn queued test messages into live broadcasts after a configuration change', function () {
    Http::fake();
    $job = new SendAgaNotificationJob(agaNotificationTestPayload());
    config(['services.aga_notifications.schema' => 'app_main_schema']);
    expect(fn () => $job->handle(app(AgaNotificationClientInterface::class)))->toThrow(AgaNotificationException::class);
    Http::assertNothingSent();
});

it('requires explicit agreement between the live payload and server destination', function () {
    config(['services.aga_notifications.schema' => 'app_main_schema']);
    Http::fake(['*' => Http::response(agaNotificationTestResult(['schema' => 'app_main_schema']))]);
    $result = app(AgaNotificationClientInterface::class)->send(new AgaNotificationDto('Test title', 'Test message', 'order_status', schema: 'app_main_schema'));
    expect($result->schema)->toBe('app_main_schema');
    Http::assertSent(fn (Request $request) => $request['schema'] === 'app_main_schema');
});

it('rejects unsupported audiences malformed recipients and non HTTPS images without sending', function () {
    Http::fake();
    $messages = [
        new AgaNotificationDto('Title', 'Message', 'order_status', audience: 'municipality'),
        new AgaNotificationDto('Title', 'Message', 'order_status', audience: 'specific'),
        new AgaNotificationDto('Title', 'Message', 'order_status', audience: 'specific', userIds: ['not-a-uuid']),
        new AgaNotificationDto('Title', 'Message', 'order_status', audience: 'specific', userIds: [['invalid']]),
        new AgaNotificationDto('Title', 'Message', 'order_status', userIds: ['872cee0c-d75b-457b-834f-3d68ae3b3a02']),
        new AgaNotificationDto('Title', 'Message', 'order_status', imageUrl: 'http://example.test/image.jpg'),
        new AgaNotificationDto('', 'Message'),
    ];
    foreach ($messages as $message) {
        expect(fn () => app(AgaNotificationClientInterface::class)->send($message))->toThrow(AgaNotificationException::class);
    }
    Http::assertNothingSent();
});

it('represents partial delivery as a non successful result and fails the job without automatic retries', function () {
    Http::fake(['*' => Http::response(agaNotificationTestResult(['sent' => 1, 'failed' => 1, 'errors' => ['a-device-failed']]))]);
    $client = app(AgaNotificationClientInterface::class);
    $result = $client->send(agaNotificationTestPayload());
    expect($result->successful())->toBeFalse()->and($result->sent)->toBe(1)->and($result->failed)->toBe(1);
    $job = new SendAgaNotificationJob(agaNotificationTestPayload());
    expect($job->tries)->toBe(1)->and($job->afterCommit)->toBeTrue()->and($job->timeout)->toBeGreaterThan(15);
    expect(fn () => $job->handle($client))->toThrow(AgaNotificationException::class, 'delivery incomplete');
});

it('does not accept invalid response shapes or destinations as delivery success', function () {
    foreach ([['ok' => true], agaNotificationTestResult(['schema' => 'app_main_schema']),
        agaNotificationTestResult(['sent' => -1]), agaNotificationTestResult(['errors' => null])] as $body) {
        Http::fake(['*' => Http::response($body)]);
        expect(fn () => app(AgaNotificationClientInterface::class)->send(agaNotificationTestPayload()))->toThrow(AgaNotificationException::class);
    }
});

it('does not leak response bodies or authorization secrets through HTTP failure exceptions', function () {
    Http::fake(['*' => Http::response(['error' => 'fake-notification-test-secret'], 401)]);
    try {
        app(AgaNotificationClientInterface::class)->send(agaNotificationTestPayload());
        test()->fail('Expected the request to fail.');
    } catch (AgaNotificationException $exception) {
        expect($exception->getMessage())->toContain('HTTP 401')->not->toContain('fake-notification-test-secret')
            ->and($exception->getPrevious())->toBeNull();
    }
    Http::assertSentCount(1);
});

it('does not retry an ambiguous connection failure', function () {
    Http::fake(['*' => Http::failedConnection()]);
    expect(fn () => app(AgaNotificationClientInterface::class)->send(agaNotificationTestPayload()))
        ->toThrow(AgaNotificationException::class, 'delivery outcome is unknown');
});

it('keeps credentials out of serialized jobs and uses an injected client', function () {
    $job = new SendAgaNotificationJob(agaNotificationTestPayload());
    expect(serialize($job))->not->toContain('fake-notification-test-secret');
    $client = Mockery::mock(AgaNotificationClientInterface::class);
    $client->shouldReceive('send')->once()->with($job->notification)
        ->andReturn(new AgaNotificationResultDto(true, 'test', 'all', 0, 0, 0, [], []));
    $job->handle($client);
});

it('omits the optional event type when missing or blank', function () {
    Http::fake(['*' => Http::response(agaNotificationTestResult())]);
    foreach ([new AgaNotificationDto(title: 'Title', message: 'Message'),
        new AgaNotificationDto('Title', 'Message', eventType: ''),
        new AgaNotificationDto('Title', 'Message', eventType: '   ')] as $notification) {
        expect(app(AgaNotificationClientInterface::class)->send($notification)->successful())->toBeTrue();
    }
    Http::assertSentCount(3);
    Http::assertNotSent(fn (Request $request) => array_key_exists('event_type', $request->data()));
});
