# Shared AGA notification integration

This client implements the external-notification request documented in the AGA Mobile integration handoff. It is reusable by Core modules through `AgaNotificationClientInterface`, bound in `SharedServiceProvider`. Facility date-specific updates and operating-status changes use this client through an opt-in queued job. Event and Announcement triggers are not connected. No user-lookup integration is included.

## Server configuration

Delivery is disabled by default. Configure these server environment values before intentionally enabling it:

```dotenv
AGA_NOTIFICATION_ENABLED=false
AGA_NOTIFICATION_SCHEMA=test
AGA_NOTIFICATION_TIMEOUT=10
# Optional; omit or leave blank to send without event_type.
AGA_FACILITY_NOTIFICATION_EVENT_TYPE=
```

The AGA developer's current request contract authenticates using `x-external-notification-secret: <secret>`. No Bearer Authorization header is sent. Set `AGA_NOTIFICATION_SECRET` to the supplied external-notification secret (without a header name or Bearer prefix).

The URL defaults to `SUPABASE_URL` plus `/functions/v1/send-external-notification`. The secret defaults to `SUPABASE_LARAVEL_EDGE_SECRET`. These reuse your existing server environment names; `SUPABASE_ANON_KEY` is not used for notification authorization. Confirm that the external-notification function expects the same shared secret. If it uses a different secret or endpoint, explicitly set `AGA_NOTIFICATION_SECRET` and/or `AGA_NOTIFICATION_URL` to the privately supplied values. Omit these optional overrides when reusing the existing settings; an explicitly blank override does not fall back.

Do not put credentials in frontend/mobile code, source files, queued payloads or logs. This integration does not change existing Supabase authentication settings. Keep the schema `test` during testing. The only supported destinations are `test` and `app_main_schema`.

After changing configuration, refresh the deployment's config cache and restart long-running workers as appropriate. Use an asynchronous queue connection and a running worker for background delivery. A `sync` connection executes the job inline, even though it is marked as queued.

## Dependency injection and dispatch

Inject `AgaNotificationClientInterface` into a job or service for direct delivery. Core modules should decide whether a change deserves a notification and construct a payload, then dispatch the shared job. Do not use model observers to broadcast every incidental save.

```php
use App\Shared\Aga\Dto\AgaNotificationDto;
use App\Shared\Aga\Jobs\SendAgaNotificationJob;

// eventType is optional; omit it when no event classification is needed.
SendAgaNotificationJob::dispatch(new AgaNotificationDto(
    eventType: 'order_status',
    title: 'Test update',
    message: 'A test status has changed.',
    schema: 'test',
));
```

The job dispatch waits for active database transactions to commit. A rollback prevents that dispatch. This is not a durable transactional outbox: a process failure between the database commit and queue publication can still lose an event. Add an outbox when wiring durable module delivery if that guarantee is required.

The DTO captures the destination. It must match server configuration when the job runs. A test DTO will be rejected rather than sent to live users if the environment changes to `app_main_schema` while the job is queued. The client refuses disabled/missing configuration before any HTTP call; disabled is not reported as successful delivery.

For selected recipients, use `audience: 'specific'` and `userIds: [...]` containing Supabase Auth UUIDs. Laravel ULIDs are not interchangeable. `audience: 'all'` sends no user_ids and means all eligible devices within the selected schema. It does not imply a municipality filter. Duplicate recipient UUIDs are collapsed before delivery. Optional imageUrl must use HTTPS.

## Results and failures

`AgaNotificationResultDto` exposes `ok`, `schema`, `audience`, `devices`, `sent`, `failed`, `invalidTokens`, `errors`, and `successful()`. A result is successful only if ok is true, failed is zero, and both error lists are empty. Zero devices/zero sent can be a valid no-recipient outcome; inspect counts when reporting delivery.

The client requires an HTTPS endpoint, sends the secret in the x-external-notification-secret header, uses bounded connection/request timeouts, does not follow redirects, and does not retry HTTP calls. It rejects malformed responses and a response with the wrong schema/audience. Partial delivery is returned to direct callers for inspection; the queued job marks it as failed with a sanitized count summary.

The job has one attempt and fails on timeout. Failed jobs can be reviewed using the application's queue tooling. Do not blindly retry a failed/partial broadcast: a timeout may mean the remote service delivered it but the response was lost. Receiver-side event IDs/idempotency are not documented yet, so exactly-once delivery and duplicate-free retries are not guaranteed. Request exceptions omit server response bodies, credentials and the original transport exception. Delivery result arrays can contain device identifiers or remote diagnostics; treat them as server-only information and do not log them indiscriminately.

## Facility integration

Facility admin forms include an unchecked notification option with a title/message preview. Only an opted-in save that changes published public information queues delivery. A date range queues one message. Unchanged saves, drafts, stale/invalid requests and rolled-back transactions do not broadcast. Existing facility.manage permission controls these forms. Deleting an exception, editing profile/weekly hours, publication and ordinary clock-based opening transitions do not trigger notifications.

Facility notifications use audience all: all eligible devices in the configured schema, including users outside the owning municipality. The municipality and facility names appear in the title. Closure dates and opening periods use Philippine time. Resuming a schedule never claims the facility is open now. Payload titles, audience and schema are constructed on the server.

The Facility option is available when delivery is enabled and HTTPS URL/secret and a supported schema are configured. The AGA developer confirmed event_type is optional. AGA_FACILITY_NOTIFICATION_EVENT_TYPE may be omitted or left blank; the outbound payload then omits event_type entirely. Set it only when an event classification is wanted. Test schema has a separate Send test notification label. The browser receives only availability/schema; credentials stay server-side.

Success feedback reports queued, not delivered. Dispatch/inline transport errors cannot roll back a saved facility update. Asynchronous failures are recorded by the queue worker; admins must review failed jobs. There is no durable delivery history or outbox yet.

## Pending integration decisions

- Agree on facility-screen routing metadata if mobile deep links are required.
- Agree on event IDs/deduplication before introducing automatic retries.
- Decide whether an outbox and persistent delivery dashboard are required.

The payload currently contains only the documented fields. Facility IDs, municipality slugs and routing metadata are not invented or silently added to outbound requests.

## Verification

`tests/Feature/Shared/AgaNotificationClientTest.php` uses fake HTTP responses and a fake secret. It exercises DI, documented payloads, recipient validation, schema separation, partial delivery, safe failures and queued-job behavior without contacting AGA or sending notifications.
