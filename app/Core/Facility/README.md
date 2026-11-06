# Public Facilities and Operating Hours

Municipality-scoped facilities with recurring weekly hours, calendar-date overrides, and ongoing operating holds. Park, playground and train records are independent. Normal hours never create Event records.

## Enable the module

The initial schema uses one migration per table. Timestamps create them in this dependency order: `facilities`, `facility_weekly_days`, `facility_weekly_periods`, `facility_schedule_exceptions`, then `facility_exception_periods`. Rollback runs in reverse order, removing children before parents.

Run against the intended application database during deployment:

```sh
php artisan migrate
php artisan db:seed --class=FacilityPermissionSeeder
```

Assign the appropriate permissions through existing user management: `facility.access`, `facility.view`, `facility.manage`, `facility.publish`, `facility.delete`. The dedicated seeder creates the permission catalogue without changing any existing grants. The general enum-driven PermissionSeeder also includes the new permissions.

Admin: `/{municipality-slug}/admin/facility`. Public: `/{municipality-slug}/facility`.

Create a draft, enter a location/address, explicitly save all seven weekdays, then publish. Contact information and an image are optional. Published edits take effect immediately. Public pages refresh status at boundaries and at least once per minute while visible.

## Request and tenancy conventions

- Page URLs use the municipality slug.
- Admin Inertia forms call `/api/facility/...` with `X-Municipality-Slug`, obtained from `usePage().props.currentMunicipality.slug`.
- Those routes belong to the web middleware stack: session authentication, CSRF, municipality context, jurisdiction guard and capability checks.
- The backend takes `municipal_id` from the resolved context; form submissions cannot select a municipality.
- Every read/mutation is explicitly scoped. Composite foreign keys prevent schedule children from crossing municipalities.
- Mutation DTOs carry the latest facility `revision`. A stale submission fails instead of overwriting newer information. All schedule mutations lock the parent and increment its revision.

## Facility addresses

`location_name` is a recognizable place or landmark, such as Municipal Plaza. The existing nullable `address` text column stores street details and barangay, for example `Beside the plaza entrance, Pinggan`. Municipality ownership is already recorded in `municipal_id`; no province or municipality is appended to new addresses. There are no separate address-part columns or additional address migrations.

The Facility-specific address editor contains a barangay dropdown and a street/details input, using existing UI primitives without changing shared address components. A Core read action loads only active barangays belonging to the current municipality's linked PSGC record. The backend validates the same municipality restriction. There are no province or municipality selectors. Form-only `address_parts` inputs are validated, trimmed and combined by the FormRequest before saving a single `address` value, limited to 2,000 characters. Direct address strings remain supported for existing records.

Editing displays the existing address without attempting to split it into dropdown values. Change address starts a replacement; cancelling preserves the previous value. An unchanged address is saved as-is, and Clear address explicitly removes it. Physical address choices never set or change the owning `municipal_id`.

## Schedule rules

`facility_weekly_days`: one row per weekday, ISO Monday 1 through Sunday 7. `facility_weekly_periods`: zero periods for a closed day; one or more for an open day. Minute fields range from 0 through 1440, where 1440 means end of day. Periods cannot overlap; touching intervals represent continuous opening. Split overnight hours across calendar dates.

`facility_schedule_exceptions` replaces a whole Manila calendar date. `facility_exception_periods` supplies that date's revised hours. `closed`/`cancelled` updates have no periods; `special_hours`/`delayed` updates require confirmed opening periods. A range shortcut creates at most 366 date records atomically, rejecting existing dates rather than silently overwriting them. Deleting an exception restores the weekly rule. Past updates and schedule audit snapshots remain available.

Use a confirmed delayed-opening exception when the new hours are known. Use facility status `delayed` or `temporarily_closed` when reopening is uncertain. These holds override every date and remain active across midnight until an admin resumes the schedule. `expected_reopens_at` is informational only. Resuming can atomically replace today's hours; resuming outside those hours still displays closed. `permanently_closed` facilities can remain published to communicate the closure.

Availability is calculated on the server using Asia/Manila and opening-inclusive, closing-exclusive intervals. There is no stored `is_open`, no daily schedule-generation job and no automatic holiday inference. Next-opening searches include future exceptions beyond a week. Unconfigured hours are distinct from seven explicitly closed days.

## AGA Mobile public API

The read-only V1 API follows the Event and Announcement endpoints:

| Request | Response |
| --- | --- |
| `GET /api/v1/facilities` | Paginated summaries: `data`, `links`, `meta` |
| `GET /api/v1/facilities/{facility}` | Facility details wrapped in `data` |

Send `Accept: application/json` and `X-Municipality-Slug: gasan-4905` on every request, including pagination requests. Public reads do not require an admin login. Middleware resolves ownership; passing `municipal_id` or `publication` does not change the public scope. Draft, deleted and foreign-municipality facility IDs return 404.

Listing supports optional `search`, `type`, `page` and `per_page`. Page size defaults to 20; valid sizes are 1–50. Invalid filters return 422. Website pagination remains at 12. The list includes `id`, `name`, `type` (`value`, `label`), `location_name`, `address`, `image_url`, `availability` and `updated_at`. Details additionally include description, public contact fields, all seven `weekly_days`, and today's/upcoming `exceptions`. Admin revision, publication controls and audit records are omitted.

`availability` uses the same calculation as the website: `timezone`, `date`, `computed_at`, `next_refresh_at`, `is_open`, `status`, `label`, `closes_at`, `next_opens_at`, `expected_reopens_at`, `today_periods`, `notice`, `notice_type`. Timestamps have explicit offsets; availability and `updated_at` use Asia/Manila. Weekdays are ISO Monday 1–Sunday 7. Periods use integer `opening_minute` and `closing_minute`; 1440 is the end of the day.

The app should refetch at `next_refresh_at` while visible and when returning to the screen. A facility's `updated_at` tracks saved changes, not clock-based opening/closing transitions. Responses use `Cache-Control: no-store`; offline copies must be clearly identified as last-known information. Delay estimates never automatically clear an operational hold. Signed image URLs expire after 15 minutes; refetch to obtain a new URL. Optional notifications are described below.

## Architecture and verification

Facility mutations use constructor-injected actions. Store and Update have separate requests, DTOs, controllers and actions; shared profile DTO filtering and exception writing remain internal reusable code. Address preparation and validation belong to profile requests; DTOs only carry validated values. Publication uses `PATCH /api/facility/{facility}/publish` with an explicit `is_published` value. Exception creation and editing use distinct entry points while preserving the shared transactional schedule writer.

Core DTOs/actions/models/services follow the Event and Announcement structure. External requests/controllers/resources are separate from React pages. Public resources omit municipality IDs, revisions and audit information. Facility images use a single-file Spatie collection and municipality-specific storage paths. Profile, publication, status and schedule changes use existing activity logging.

```sh
php artisan test --filter=FacilityModuleTest
php artisan test --filter=SitemapTest
npm run types
npm run build
```

Feature tests use the real migrations on an isolated test database and cover timezone/boundary behavior, exception precedence, long closures, uncertain holds, publication, tenant foreign keys, conflicting/stale edits, slug-header requests, permissions and media paths.

Mobile JSON reads reuse the Core actions and availability service. Event/Announcement links and individual train departures remain deferred; operational notices are already structured data.

## Optional AGA Mobile notifications

Date-specific updates and operating-status saves have an unchecked notification option and a preview. It is available only for published facilities when shared AGA delivery is configured. The existing requests, DTOs and actions carry notify_mobile separately from saved schedule data. Unchanged, invalid, stale or foreign-municipality submissions never broadcast. A range produces one notification. Notifications target all eligible AGA devices, including other municipalities, with the facility and municipality in the title.

Jobs dispatch after transaction commit using app/Shared/Aga. A delivery/queue failure does not undo the saved update. Feedback reports queued or skipped rather than promising delivery. Test mode is explicitly labelled; live schema is app_main_schema. No automatic broadcasts occur for ordinary opening-hour transitions, profile/weekly edits, publication or exception deletion.

Delivery is disabled by default. AGA_FACILITY_NOTIFICATION_EVENT_TYPE is optional, as confirmed by the mobile developer. Omit it or leave it blank to send without event_type; it does not prevent enabling the checkbox. Keep AGA_NOTIFICATION_SCHEMA=test while verifying and use an asynchronous queue worker. See app/Shared/Aga/README.md for credentials, environment values, schema protection and retry limitations. No database migration is required.

FacilityNotificationTest verifies opt-in requests, all-user payloads, date ranges, no-op detection, transaction timing/rollback, configuration guards and saved updates on dispatch failure using fake HTTP/queue integrations.
