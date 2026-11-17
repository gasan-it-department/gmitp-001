# AGA Mobile - Facilities API integration guide

Version: 2.0
Updated: 10 November 2026
Audience: AGA Mobile developer and any AI implementing the integration

## 1. Required behavior: the API controls which cards exist

**Build every facility card from the facilities LIST response. The list is the source of truth for card membership, names, types, images and current availability.**

Do not hard-code a Train, Park, Playground or any other facility card, name or ID and then use this API only to fill in its hours. The names and IDs in this document are examples, not records to seed into the mobile app.

Correct behavior:

| Backend change | Next successful mobile list refresh |
| --- | --- |
| Publish a new facility | Add a card using the new API record |
| Rename a facility | Update the existing card with the same id |
| Unpublish a facility | Remove its card; do not leave a card with missing hours |
| Delete a facility | Remove its card |
| Close, cancel or delay a published facility | Keep its card and display the status and explanation |
| Republish a facility | Show it again when it returns in the list |
| Return an empty list | Show the empty state and remove previous cards for that list |

Publication and operating status are different. A published Train with status cancelled is still public and must stay visible. An unpublished Train is absent from the list and must disappear after refresh. A Park and a Train in the same area are independent facility records.

The public response does not contain an is_published field. The backend already filters publication. Do not add a client filter that expects item.is_published.

Use id as the stable UI key and detail identifier. Do not identify records by name, array position, or type; names can change and several facilities can share a type.

A static Facilities navigation item or static type filter is fine. A static inventory of facility cards is not. A decorative placeholder image must never create a facility card.

### Example of the reported bug

Initial successful list: Train + Park. Render two cards.

After the admin unpublishes Train, the next complete list contains only Park. Replace the displayed collection with that result: render one Park card. Do not keep a built-in Train card, merge the response into an old map without deleting absent records, or continue polling only the known Train detail URL.

The backend does not instantly remove an already rendered card on a phone. The app learns about changes through a fresh list request. See section 8 for polling, resume and pagination rules.

## 2. Scope, environment and required headers

These are public READ APIs. Facility administration stays on the web. Confirm the deployed backend origin and municipality slug with the backend developer before release.

Replace https://YOUR-API-HOST with that environment's actual origin. Never ship this placeholder. Examples below were captured from isolated API fixtures with the clock fixed at 9 November 2026, 10:00 AM in Asia/Manila. They illustrate the contract, not current production data. api.example.invalid in response links is also an example origin.

Send these headers on EVERY request, including detail requests and pagination:

```http
Accept: application/json
X-Municipality-Slug: gasan-4905
```

Use the municipality slug already used for the app's Events and Announcements integration. Do not replace it with a municipal_id. The backend resolves and enforces municipality ownership.

Public reads require no admin login or Bearer token under the current routes. Do not embed notification secrets, Supabase secrets or admin credentials in the mobile app.

GET requests have no JSON body. JSON shown here is the RESPONSE body.

Keep development and production origins separate. Scope all list and detail caches by API origin/environment AND municipality. Never show a previous municipality's cards while a new municipality is loading.

## 3. Endpoints, filters and facility types

| Method | Path | Returns |
| --- | --- | --- |
| GET | /api/v1/facilities | Paginated summaries of published facilities |
| GET | /api/v1/facilities/{facility} | Detail for one published facility |

Use the exact opaque id returned by the list for {facility}. Both endpoints send Cache-Control: no-store. Do not rely on a permanently cached HTTP response.

### List query parameters

| Parameter | Meaning | Constraint |
| --- | --- | --- |
| search | Search name and location_name | Optional string, maximum 255 characters |
| type | Filter by type.value | Optional; one of the values below |
| page | Page number | Integer, minimum 1; default 1 |
| per_page | Page size | Integer 1-50; default 20 |

The list is ordered by name, then id. Do not depend on a particular sample record being first. A page size of 50 does not guarantee that all facilities fit on one page.

Omit type to request all types. Do not send type=all, type=train or type=service_update. Invalid supported parameter values return HTTP 422; per_page above 50 is rejected. Unknown parameters are not supported filters; publication=draft and municipal_id cannot expose drafts or override municipality ownership.

| type.value | type.label |
| --- | --- |
| park | Park |
| playground | Playground |
| amusement_ride | Amusement ride |
| sports_facility | Sports facility |
| other | Other |

A children's Train is a facility whose current classification may be amusement_ride. There is no special Train endpoint and no train enum value. The UI must support zero, one or many facilities of every type. Use type.value for filtering and type.label for display; support a neutral fallback for a future type.

Examples:

```http
GET /api/v1/facilities?per_page=50
GET /api/v1/facilities?type=amusement_ride&per_page=50
GET /api/v1/facilities?search=park&per_page=20&page=1
GET /api/v1/facilities/01m6znmr5zce56chk2sehq7c0b
```

Preserve search, type, per_page and municipality headers across pagination. Use links.next or reconstruct a request to the configured trusted origin using the returned page/query. Do not follow a pagination URL to an arbitrary different host. Null links.next means the last page.

## 4. List response: data creates the cards

The following is one complete example page containing all five current types. In a real deployment, records, order, counts, times and notices will differ.

```json
{
  "data": [
    {
      "id": "01m6znmr5pv73h27qza1ecxmhx",
      "name": "Children's Playground",
      "type": {
        "value": "playground",
        "label": "Playground"
      },
      "location_name": "Municipal Plaza",
      "address": "Plaza entrance, Pinggan",
      "image_url": null,
      "availability": {
        "timezone": "Asia/Manila",
        "date": "2026-11-09",
        "computed_at": "2026-11-09T10:00:00+08:00",
        "next_refresh_at": "2026-11-09T10:01:00+08:00",
        "is_open": false,
        "status": "closed",
        "label": "Closed now",
        "closes_at": null,
        "next_opens_at": null,
        "expected_reopens_at": null,
        "today_periods": [],
        "notice": null,
        "notice_type": null
      },
      "updated_at": "2026-11-09T10:00:00+08:00"
    },
    {
      "id": "01m6znmr5zce56chk2sehq7c0b",
      "name": "Children's Train",
      "type": {
        "value": "amusement_ride",
        "label": "Amusement ride"
      },
      "location_name": "Municipal Plaza",
      "address": "Plaza entrance, Pinggan",
      "image_url": null,
      "availability": {
        "timezone": "Asia/Manila",
        "date": "2026-11-09",
        "computed_at": "2026-11-09T10:00:00+08:00",
        "next_refresh_at": "2026-11-09T10:01:00+08:00",
        "is_open": false,
        "status": "cancelled",
        "label": "Cancelled today",
        "closes_at": null,
        "next_opens_at": "2026-11-10T13:00:00+08:00",
        "expected_reopens_at": null,
        "today_periods": [],
        "notice": "Train rides are cancelled today due to maintenance.",
        "notice_type": "cancelled"
      },
      "updated_at": "2026-11-09T10:00:00+08:00"
    },
    {
      "id": "01m6znmr33fxga9jhhbsxnyy6a",
      "name": "Municipal Park",
      "type": {
        "value": "park",
        "label": "Park"
      },
      "location_name": "Municipal Plaza",
      "address": "Plaza entrance, Pinggan",
      "image_url": null,
      "availability": {
        "timezone": "Asia/Manila",
        "date": "2026-11-09",
        "computed_at": "2026-11-09T10:00:00+08:00",
        "next_refresh_at": "2026-11-09T10:01:00+08:00",
        "is_open": true,
        "status": "open",
        "label": "Open now",
        "closes_at": "2026-11-09T17:00:00+08:00",
        "next_opens_at": null,
        "expected_reopens_at": null,
        "today_periods": [
          {
            "opening_minute": 480,
            "closing_minute": 1020
          }
        ],
        "notice": null,
        "notice_type": null
      },
      "updated_at": "2026-11-09T10:00:00+08:00"
    },
    {
      "id": "01m6znmr85gc31tmqcf5hd2v0m",
      "name": "Municipal Sports Court",
      "type": {
        "value": "sports_facility",
        "label": "Sports facility"
      },
      "location_name": "Municipal Plaza",
      "address": "Plaza entrance, Pinggan",
      "image_url": null,
      "availability": {
        "timezone": "Asia/Manila",
        "date": "2026-11-09",
        "computed_at": "2026-11-09T10:00:00+08:00",
        "next_refresh_at": "2026-11-09T10:01:00+08:00",
        "is_open": false,
        "status": "temporarily_closed",
        "label": "Temporarily closed",
        "closes_at": null,
        "next_opens_at": null,
        "expected_reopens_at": "2026-11-09T15:00:00+08:00",
        "today_periods": [
          {
            "opening_minute": 480,
            "closing_minute": 1020
          }
        ],
        "notice": "Court repairs are ongoing.",
        "notice_type": "temporarily_closed"
      },
      "updated_at": "2026-11-09T10:00:00+08:00"
    },
    {
      "id": "01m6znmr8x43sat14bw6b8jpks",
      "name": "Visitor Information Center",
      "type": {
        "value": "other",
        "label": "Other"
      },
      "location_name": "Municipal Plaza",
      "address": "Plaza entrance, Pinggan",
      "image_url": null,
      "availability": {
        "timezone": "Asia/Manila",
        "date": "2026-11-09",
        "computed_at": "2026-11-09T10:00:00+08:00",
        "next_refresh_at": "2026-11-09T10:01:00+08:00",
        "is_open": true,
        "status": "open",
        "label": "Open now",
        "closes_at": "2026-11-09T17:00:00+08:00",
        "next_opens_at": null,
        "expected_reopens_at": null,
        "today_periods": [
          {
            "opening_minute": 480,
            "closing_minute": 1020
          }
        ],
        "notice": null,
        "notice_type": null
      },
      "updated_at": "2026-11-09T10:00:00+08:00"
    }
  ],
  "links": {
    "first": "https://api.example.invalid/api/v1/facilities?page=1",
    "last": "https://api.example.invalid/api/v1/facilities?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "page": null,
        "active": false
      },
      {
        "url": "https://api.example.invalid/api/v1/facilities?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "page": null,
        "active": false
      }
    ],
    "path": "https://api.example.invalid/api/v1/facilities",
    "per_page": 20,
    "to": 5,
    "total": 5
  }
}
```

Read the collection from response.data, not the root JSON object. links and meta are pagination information and are not facility cards.

### Summary fields

| Field | Meaning and UI handling |
| --- | --- |
| id | Stable opaque identifier; UI key and detail URL identifier |
| name | Display name supplied by the admin |
| type | Object with value and label; not a plain string |
| location_name | Optional named place; may be null |
| address | Optional stored street/barangay text; may be null |
| image_url | Optional ready-to-use image URL; may be null |
| availability | Calculated current status, notice and effective hours |
| updated_at | Last saved record change; not a timer for schedule transitions |

Use image_url as provided. The backend uses the optimized image when available and can fall back to the original. Do not build media paths or conversion filenames in the app. URLs can be signed and expire; request fresh API data to obtain a new URL. A missing/failed image gets a local visual placeholder within an existing API card.

Nullable location, address, image or time fields do not make a published facility invalid. Do not remove a card because next_opens_at is null, today_periods is empty, or is_open is false/null.

### Empty result is successful data

This example is a valid HTTP 200 empty search result:

```json
{
  "data": [],
  "links": {
    "first": "https://api.example.invalid/api/v1/facilities?search=no-matching-example&page=1",
    "last": "https://api.example.invalid/api/v1/facilities?search=no-matching-example&page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": null,
    "last_page": 1,
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "page": null,
        "active": false
      },
      {
        "url": "https://api.example.invalid/api/v1/facilities?search=no-matching-example&page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "page": null,
        "active": false
      }
    ],
    "path": "https://api.example.invalid/api/v1/facilities",
    "per_page": 20,
    "to": null,
    "total": 0
  }
}
```

Clear the displayed collection for the requested list and show an appropriate empty message. For an unfiltered municipality list, say no facilities are currently available. For a filtered search, say no matching facilities. A filtered empty response does not prove that facilities outside the filter were unpublished.

Do not restore default/sample Train or Park cards after an empty response.

## 5. Detail response and schedule data

Open details using the tapped card's id, not a hard-coded facility ID. The detail endpoint returns one object under data.

```json
{
  "data": {
    "id": "01m6znmr5zce56chk2sehq7c0b",
    "name": "Children's Train",
    "type": {
      "value": "amusement_ride",
      "label": "Amusement ride"
    },
    "location_name": "Municipal Plaza",
    "address": "Plaza entrance, Pinggan",
    "image_url": null,
    "availability": {
      "timezone": "Asia/Manila",
      "date": "2026-11-09",
      "computed_at": "2026-11-09T10:00:00+08:00",
      "next_refresh_at": "2026-11-09T10:01:00+08:00",
      "is_open": false,
      "status": "cancelled",
      "label": "Cancelled today",
      "closes_at": null,
      "next_opens_at": "2026-11-10T13:00:00+08:00",
      "expected_reopens_at": null,
      "today_periods": [],
      "notice": "Train rides are cancelled today due to maintenance.",
      "notice_type": "cancelled"
    },
    "description": "Public facility managed by the municipality.",
    "contact_name": null,
    "contact_phone": null,
    "contact_email": null,
    "weekly_days": [
      {
        "day_of_week": 1,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      },
      {
        "day_of_week": 2,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      },
      {
        "day_of_week": 3,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      },
      {
        "day_of_week": 4,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      },
      {
        "day_of_week": 5,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      },
      {
        "day_of_week": 6,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      },
      {
        "day_of_week": 7,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 780,
            "closing_minute": 1020
          }
        ]
      }
    ],
    "exceptions": [
      {
        "id": "01m6znmr7y78hpjx0nt40q9xd8",
        "exception_date": "2026-11-09",
        "is_closed": true,
        "notice_type": "cancelled",
        "public_notice": "Train rides are cancelled today due to maintenance.",
        "periods": []
      }
    ],
    "updated_at": "2026-11-09T10:00:00+08:00"
  }
}
```

Details include the summary fields plus:

| Field | Shape / meaning |
| --- | --- |
| description | Optional public description |
| contact_name | Optional public contact |
| contact_phone | Optional public phone |
| contact_email | Optional public email |
| weekly_days | Array of day_of_week, is_closed and periods |
| exceptions | Array of date-specific updates and their periods |
| exceptions[].id | Identifier of an exception, not a facility identifier |
| exceptions[].exception_date | Manila calendar date, YYYY-MM-DD |
| exceptions[].is_closed | Whether that entire date has no operating periods |
| exceptions[].notice_type | Notice classification |
| exceptions[].public_notice | Public explanation |
| periods[] | opening_minute and closing_minute integer fields |

The current detail response includes exceptions dated today or later, not a complete historical change log. Administrative fields such as municipal_id, publication flags, revision counters and audit information are not part of this public contract.

Use availability for the current badge. Weekly hours show the normal recurring schedule; exceptions explain date changes. Never show regular hours as proof that a cancelled facility is open.

An unpublished, deleted, foreign-municipality, draft or invalid-ID detail is unavailable (HTTP 404). Clear a stale detail view, stop polling that unavailable record and refresh the list. Do not turn a 404 into an empty schedule attached to a permanent hard-coded card.

## 6. Availability and status handling

Use `availability.status` for application logic and badges, and `availability.label` as the server's display text. Do not derive current availability from weekly hours alone.

| status | Typical meaning | is_open |
| --- | --- | --- |
| open | Inside the current effective opening period | true |
| closed | Outside effective hours, or closed for a date | false |
| cancelled | Today's operation has been cancelled | false |
| delayed | Confirmed later opening, or an indefinite delay hold | false |
| temporarily_closed | Admin has placed an ongoing closure hold | false |
| permanently_closed | Facility has permanently closed but its notice remains published | false |
| unknown | Hours are unavailable or incomplete | null |

Handle an unrecognized future status with a neutral fallback and the server label. Never interpret a null is_open as true.

| Availability field | Meaning |
| --- | --- |
| timezone | Asia/Manila |
| date | Current local calendar date |
| computed_at | Time the status was calculated |
| next_refresh_at | Time to request updated information while the screen is visible |
| today_periods | Effective opening periods for today, after date exceptions |
| closes_at | Next calculated closing transition when currently open; may be null |
| next_opens_at | Next confirmed opening under the effective schedule; may be null |
| expected_reopens_at | Admin-provided estimate for a hold; informational only |
| notice | Current public explanation, or null |
| notice_type | Public notice classification, or null |

`notice_type` can be `special_hours`, `closed`, `cancelled`, `delayed`, `temporarily_closed`, `permanently_closed`, or null. It is contextual information, not a replacement for status. An open facility can still have a special-hours or earlier-delay notice.

Status follows saved schedules and admin updates; it is not live telemetry from the facility.

### Two kinds of delay

- Confirmed delayed opening: today's exception contains revised hours. Before opening, status is delayed and next_opens_at has the confirmed opening. At that time, the backend may return open.
- Uncertain delay: an admin hold overrides schedules until explicitly cleared. next_opens_at is null. expected_reopens_at can contain an estimate, including an estimate that has already passed. Never change to open locally because that estimate was reached.

For temporary/permanent holds, today_periods may still show planned hours. Display those as scheduled hours and keep the closure notice prominent. is_open and status determine the current badge.

## 7. Weekly hours and exceptions

Weekdays use ISO numbering: Monday 1, Tuesday 2, Wednesday 3, Thursday 4, Friday 5, Saturday 6, Sunday 7.

Periods contain integer minutes after midnight:
- 360 = 6:00 AM.
- 480 = 8:00 AM.
- 720 = noon.
- 1320 = 10:00 PM.
- 1440 = midnight at the END of that day.

Format times for the user without changing their meaning. In particular, 1440 is not the beginning of the same day. Multiple periods represent breaks in operation. A closed day has no periods.

Opening boundaries are inclusive; closing boundaries are exclusive. Overnight hours are split across calendar dates. A date exception replaces that entire date's regular hours. Closed/cancelled exceptions have is_closed true and an empty periods array.

Precedence:
1. Ongoing delay or closure hold.
2. Date-specific exception.
3. Regular weekday schedule.

Display exceptions by exception_date as a Manila calendar date; do not shift a date-only string through the device timezone. Timestamps have explicit offsets and should be interpreted as instants, then displayed in Philippine time for facility schedules.

## 8. Mobile state, refresh and pagination implementation

### Initial load and every refresh

1. Capture the current API origin, municipality slug, search and type as the request scope.
2. Start a new request generation. Cancel or ignore responses from older generations, especially after a municipality/filter change.
3. Fetch page 1 with the required headers. For a small catalog, fetch all remaining pages into a NEW temporary collection.
4. Validate successful status, JSON shape, record IDs and page continuity. Commit only a complete successful collection for the same scope/generation.
5. REPLACE the old list for that scope with the newly fetched collection.
6. Render one card per returned record and schedule the next list refresh.

Avoid upsert-only code such as adding every returned item to an existing map and never removing old keys. That leaves unpublished records visible.

Framework-neutral pseudocode:

```text
refreshFacilities(scope):
    generation = startNewGeneration(scope)
    candidate = []
    nextPage = firstFacilitiesPage(scope)

    while nextPage exists:
        response = GET nextPage with Accept and municipality headers
        require successful JSON list response
        require response still belongs to current scope and generation
        validate pagination; collect response.data into candidate
        nextPage = response.links.next

    require generation and scope still current
    replaceFacilitiesForScope(scope, candidate)
    scheduleNextListRefresh(candidate)
```

This replacement applies to the completed list, not just one page. If using infinite scroll, append later pages only within the same request generation. A refresh starts a new page sequence; do not merge its first page into stale pages from an older sequence.

### How to handle removed records and caches

After a complete successful UNFILTERED municipality snapshot, IDs missing from that snapshot can be removed from that municipality's cached facility inventory and related detail caches.

Absence from a single page, a search result or a type-filtered result is not evidence of global unpublication. Replace that view's results, but do not globally delete unrelated facilities based on that partial view.

Cache keys must include origin/environment and municipality. List keys also include search/type and pagination strategy; detail keys include id. Ignore late responses from a previous municipality or previous filter. Use an explicit loading state during scope changes.

### Pagination consistency

Pagination is page based, not a frozen database snapshot. A facility can be published, renamed or unpublished between page requests.

Use meta.total/current_page/last_page and links.next to detect obviously inconsistent runs. Reject duplicate IDs, repeated page links, changing totals or an incomplete unique-record count. Discard the partial candidate and retry from page 1 with a bounded retry policy. If retries fail, show a refresh error instead of treating a partial result as a complete inventory. These checks detect common changes; the API does not guarantee snapshot isolation.

Never remove cards merely because they were absent from page 1 while more pages remain. Avoid a partial refresh that deletes page-2 cards and avoid an append-only refresh that retains old page-2 cards forever.

### Refresh timing and discovering new/unpublished facilities

- Fetch the list when the Facilities screen opens.
- Refresh on app resume or returning to the screen, and support pull-to-refresh.
- While visible, use the earliest valid availability.next_refresh_at among the loaded facilities to refresh the LIST. One shared timer is sufficient.
- The backend normally sets next_refresh_at within one minute, or sooner at a transition/midnight.
- An empty list has no item timer. Continue a modest visible-screen discovery poll, for example every 60 seconds, so newly published facilities can appear.
- Stop screen polling while hidden/backgrounded; refresh on return.
- Refetch details while the detail screen is visible, and refresh the list when returning. Refreshing only existing detail URLs cannot discover newly published facilities.
- If a timestamp is already due, refresh promptly with a small minimum interval to avoid a tight loop. Back off on network errors.
- Do not use updated_at alone to decide whether to refresh. Open/closed status changes as time passes without a record edit.

The app must request fresh data at an opening/closing boundary; a countdown may help presentation but must not invent an open state. Polling is not an instant push guarantee, and admin notifications are optional.

### Loading, errors and offline behavior

Keep loading, successful empty, successful populated and error states distinct. A failed request is not a successful empty list.

If retaining previously loaded data after a network failure, label it as stale/offline with its last refresh time. Do not present an old open badge as current. After the next successful complete response, replace it normally, including removal of unpublished records.

Check status and Content-Type before decoding success JSON. Retry transient failures with bounded backoff. Do not repeatedly retry 404 detail or 422 invalid-filter requests without changing the request. A detail 404 clears its stale detail and triggers a list refresh.

## 9. HTTP and error handling

| Result | Meaning | Mobile action |
| --- | --- | --- |
| 200 list, data populated | Matching public records | Replace the completed list for this scope |
| 200 list, data empty | No matching public records | Clear this view and show an empty state |
| 200 detail | Public facility still available | Display fresh detail and availability |
| 404 detail | Facility unavailable for this municipality | Clear stale detail, stop its timer, refresh list |
| 422 | Invalid supported query parameter | Fix the request; show a useful error |
| 403 / context-related 404 | Missing, inactive or invalid municipality context | Check configured origin/slug |
| 429 / 5xx / network failure | Request failed | Show error/stale state and back off |

Illustrative validation response; messages may vary:

```json
{
  "message": "The selected type is invalid.",
  "errors": {
    "type": ["The selected type is invalid."]
  }
}
```

Municipality restriction middleware can return an Inertia/HTML restriction response. Do not assume every error follows this JSON shape. Check HTTP status and Content-Type. HTTP success must also match the expected list/detail schema.

## 10. Notifications are separate from public API reads

The backend can optionally queue an AGA notification when an admin saves a qualifying date-specific update or operating-status change and chooses to notify users. The server calls the AGA notification endpoint; the mobile Facilities GET requests do not send notifications.

A notification is a prompt to reload authoritative list/detail data. Do not create a facility card from notification text, assume every admin edit sends a notification, or depend on notifications to remove unpublished cards.

The current external notification message does not provide a guaranteed facility ID/deep link. Do not invent an ID by matching a Train name. If opening Facilities from a general notification, refresh the list first.

The optional notification event_type is not the facilities type enum and must not be used as the list's type query. Server notification credentials belong only on the backend.

## 11. Acceptance checks for the mobile developer

Run these against a backend test environment, using real test records created by the web admin:

| Test | Expected result |
| --- | --- |
| Publish Park and Train | Two cards populated entirely from list records |
| Unpublish Train, then refresh | Only Park remains; no empty Train card |
| Unpublish all facilities | Successful empty state; no built-in cards |
| Republish Train | Train returns on the next list refresh |
| Rename Train | Existing id now displays the new name |
| Publish another amusement ride | Separate card; same type does not replace Train |
| Publish several facilities of all five types | Every returned record can render |
| Set a published facility to temporarily/permanently closed | Card remains with closure badge and notice |
| Cancel today's operation | Card remains, cancelled status overrides weekly hours |
| Confirm a delayed opening | Shows delayed until backend returns open at confirmed time |
| Set an uncertain reopening estimate | Does not open locally when the estimate passes |
| More records than per_page | All pages accessible, no missing or duplicate cards |
| Remove an item formerly on a later page | It disappears after a full refreshed page sequence |
| Filter/search, then clear filters | Correct collections; filtered absence does not delete global cache |
| Switch municipality during an in-flight request | Old response cannot populate new municipality |
| Switch development/production | No cache mixing between origins |
| Unpublish an open detail record | Detail request returns 404; stale detail clears |
| Null image/contact/next opening | Card remains; optional fields get safe display handling |
| Background/resume and exact opening/closing time | Fresh API status displayed |
| Network error after a prior successful load | Error/stale state, not fabricated empty success |
| Open app with no facilities, publish one while screen visible | Discovery polling makes it appear |

Before release, confirm the deployed origin, slug and backend version. Test with actual dynamic records; do not ship the sample fixture names or IDs as app data.

## 12. Copyable implementation brief for the mobile developer's AI

Implement a dynamic Facilities screen using GET /api/v1/facilities with Accept: application/json and the selected municipality's X-Municipality-Slug header.

The API list owns which facility cards exist. Render one card for each response.data record, keyed by its opaque id. Do not hard-code Train/Park/Playground cards, names, IDs or a one-card-per-type inventory. Omit the type filter to get all facility types; support multiple records of the same type.

On every successful complete list refresh, replace the old collection. If Train is unpublished, it is absent from the refreshed collection and its card must disappear. If a published Train is cancelled, delayed or closed, it is still returned and must stay visible with the server availability badge and notice. Empty data is a valid empty state and must remove previous cards for that list.

Implement pagination, request generation/cancellation, municipality/environment-scoped caches, visible-screen list refresh using next_refresh_at, discovery polling for an empty list, resume/pull refresh, detail loading by returned id, graceful detail 404, null fields, Manila time formatting and distinct offline/error states. Do not treat failed or partial page requests as a complete successful inventory.

Use availability.status/is_open for the current status and availability.label for display. Weekly schedules do not override cancellations or ongoing holds. expected_reopens_at is an estimate and never automatically reopens a facility. No mobile admin write endpoints or notification secrets are needed.
