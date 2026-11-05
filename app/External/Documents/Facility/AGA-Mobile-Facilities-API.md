# AGA Mobile — Facilities API integration guide
Version: 1.0  
Prepared: 5 November 2026  
Audience: AGA Mobile application developer

## 1. Integration scope and deployment

This API supplies public facility information to the mobile app. Facility administration remains on the web. The backend endpoints are implemented and tested; confirm deployment and the actual API host with the backend developer before connecting a production app.

Replace `https://YOUR-API-HOST` in every example with the deployed backend origin. This is a placeholder, not a working host. All sample names, IDs, schedules and notices below are illustrative.

Only published, non-deleted facilities in the selected municipality are returned. Published facilities remain visible during cancellations, delays and closures so citizens can read the notice. Park, playground and train ride records operate independently.

There are no mobile write endpoints or push notifications in this release. Public reads require no admin login or bearer token under the current API routes.

## 2. Required headers

Send these headers on every request, including requests to pagination links:

```http
Accept: application/json
X-Municipality-Slug: gasan-4905
```

Use the municipality slug already used by the app's Event and Announcement APIs. Do not send a numeric or ULID municipal_id as a replacement for the slug. The backend resolves and enforces municipality ownership.

GET requests have no JSON request body. The JSON examples in this document are response bodies.

## 3. Endpoints

| Method | Path | Result |
| --- | --- | --- |
| GET | /api/v1/facilities | Paginated public summaries |
| GET | /api/v1/facilities/{facility} | Details for one published facility |

`{facility}` is the ULID returned in the list item's `id`. Treat it as an opaque string. Both endpoints return `Cache-Control: no-store`.

### Listing query parameters

| Parameter | Type | Default / constraint |
| --- | --- | --- |
| search | string | Optional; maximum 255 characters; searches name and location_name |
| type | string | Optional; one of the facility type values below |
| page | integer | Default 1; minimum 1 |
| per_page | integer | Default 20; minimum 1, maximum 50 |

Invalid parameter values return HTTP 422. A size above 50 is rejected, not silently capped by the request validator. Unknown parameters are not supported filters. In particular, `publication=draft` or `municipal_id=...` cannot expose drafts or change municipality ownership.

Valid facility types:

| Value | Label |
| --- | --- |
| park | Park |
| playground | Playground |
| amusement_ride | Amusement ride |
| sports_facility | Sports facility |
| other | Other |

### Example requests

```sh
curl "https://YOUR-API-HOST/api/v1/facilities?type=park&per_page=20&page=1" \
  -H "Accept: application/json" \
  -H "X-Municipality-Slug: gasan-4905"
```

```sh
curl "https://YOUR-API-HOST/api/v1/facilities/01ARZ3NDEKTSV4RRFFQ69G5FAV" \
  -H "Accept: application/json" \
  -H "X-Municipality-Slug: gasan-4905"
```

The multiline commands use a POSIX shell. In PowerShell, use curl.exe and put the command on one line.

## 4. List response example

This example has one matching facility. The park's operation is cancelled for today, while the record remains publicly visible.

```json
{
  "data": [
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "name": "Municipal Park",
      "type": {
        "value": "park",
        "label": "Park"
      },
      "location_name": "Municipal Plaza",
      "address": "Beside the plaza entrance, Pinggan",
      "image_url": null,
      "availability": {
        "timezone": "Asia/Manila",
        "date": "2026-11-05",
        "computed_at": "2026-11-05T15:00:00+08:00",
        "next_refresh_at": "2026-11-05T15:01:00+08:00",
        "is_open": false,
        "status": "cancelled",
        "label": "Cancelled today",
        "closes_at": null,
        "next_opens_at": "2026-11-06T06:00:00+08:00",
        "expected_reopens_at": null,
        "today_periods": [],
        "notice": "Park operations are cancelled for the remainder of today due to heavy rain.",
        "notice_type": "cancelled"
      },
      "updated_at": "2026-11-05T15:00:00+08:00"
    }
  ],
  "links": {
    "first": "https://YOUR-API-HOST/api/v1/facilities?page=1",
    "last": "https://YOUR-API-HOST/api/v1/facilities?page=1",
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
        "active": false
      },
      {
        "url": "https://YOUR-API-HOST/api/v1/facilities?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "active": false
      }
    ],
    "path": "https://YOUR-API-HOST/api/v1/facilities",
    "per_page": 20,
    "to": 1,
    "total": 1
  }
}
```

Use `data` for list cards. Follow `links.next` until it is null, or use `meta.current_page` and `meta.last_page`. Send the same municipality header on every page. Pagination links preserve the submitted query parameters. The host and links above are illustrative.

No matches produce an empty `data` array. Nullable pagination range values such as `from` and `to` should be handled. Laravel pagination labels may contain HTML entities; use native pagination controls or decode labels before displaying them.

The list intentionally omits description, contacts, weekly_days and exceptions. Fetch the detail endpoint when opening a facility.

## 5. Detail response example

This facility normally opens 6 AM–10 PM daily, but a cancellation overrides today's hours.

```json
{
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "name": "Municipal Park",
    "type": {
      "value": "park",
      "label": "Park"
    },
    "location_name": "Municipal Plaza",
    "address": "Beside the plaza entrance, Pinggan",
    "image_url": null,
    "availability": {
      "timezone": "Asia/Manila",
      "date": "2026-11-05",
      "computed_at": "2026-11-05T15:00:00+08:00",
      "next_refresh_at": "2026-11-05T15:01:00+08:00",
      "is_open": false,
      "status": "cancelled",
      "label": "Cancelled today",
      "closes_at": null,
      "next_opens_at": "2026-11-06T06:00:00+08:00",
      "expected_reopens_at": null,
      "today_periods": [],
      "notice": "Park operations are cancelled for the remainder of today due to heavy rain.",
      "notice_type": "cancelled"
    },
    "updated_at": "2026-11-05T15:00:00+08:00",
    "description": "A public park for recreation and family activities.",
    "contact_name": "Municipal Office",
    "contact_phone": null,
    "contact_email": null,
    "weekly_days": [
      {
        "day_of_week": 1,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      },
      {
        "day_of_week": 2,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      },
      {
        "day_of_week": 3,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      },
      {
        "day_of_week": 4,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      },
      {
        "day_of_week": 5,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      },
      {
        "day_of_week": 6,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      },
      {
        "day_of_week": 7,
        "is_closed": false,
        "periods": [
          {
            "opening_minute": 360,
            "closing_minute": 1320
          }
        ]
      }
    ],
    "exceptions": [
      {
        "id": "01ARZ3NDEKTSV4RRFFQ69G5FAW",
        "exception_date": "2026-11-05",
        "is_closed": true,
        "notice_type": "cancelled",
        "public_notice": "Park operations are cancelled for the remainder of today due to heavy rain.",
        "periods": []
      }
    ]
  }
}
```

### Public field notes

| Field | Meaning |
| --- | --- |
| id | Facility ULID |
| name | Public facility name |
| type | Machine value and display label |
| location_name | Place or landmark, such as Municipal Plaza |
| address | Combined street/details and barangay; municipality is already selected in the app |
| image_url | Image URL or null |
| availability | Current server-calculated status and effective hours |
| updated_at | Last saved facility change, with timezone offset |
| description | Nullable public description; detail only |
| contact_name / contact_phone / contact_email | Nullable public contact information; detail only |
| weekly_days | Regular recurring schedule; detail only |
| exceptions | Today's and upcoming date-specific replacements; detail only |

Optional text and image fields may be null. Admin fields such as municipal_id, revision, is_published and audit_log are not exposed.

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

## 8. Refreshing, images and offline behavior

Refetch at next_refresh_at while the relevant screen is visible, when the app resumes or the screen regains focus, and on manual refresh. Stop background screen polling when hidden. After receiving a new response, schedule using its new next_refresh_at. If that time is already past, refetch once; avoid a tight retry loop.

The current service schedules a refresh at most one minute ahead and sooner at an opening/closing transition or local midnight. Do not use updated_at alone for status caching: a facility can open because time passed without any database edit.

No push notification is sent by these endpoints. A cancellation appears in the app after the next successful fetch.

Responses use no-store. If the app intentionally retains an offline copy, show a last-updated indicator and identify the status as last-known information. Handle network failures with a retry option and bounded retry/backoff; do not present stale open status as freshly confirmed.

image_url can be null. S3 image URLs expire after 15 minutes; refetch the facility response for a new URL after expiry or an expired-image failure. Do not store a signed image URL as a permanent address.

## 9. Error handling

| HTTP status | Meaning / action |
| --- | --- |
| 200 | Successful list or detail JSON |
| 403 | Municipality context is missing, unknown or inactive; verify the slug and selected municipality |
| 404 | Unknown/malformed facility ID, draft, deleted facility, or facility outside the selected municipality |
| 405 | Unsupported method; this API provides GET reads only |
| 422 | Invalid list query parameters; inspect the errors object |
| 5xx / network failure | Show retry state; avoid overwriting valid content with an empty list |

A typical 422 response has a message and errors keyed by parameter, for example:
```json
{
  "message": "The per page field must be at least 1.",
  "errors": {
    "per_page": [
      "The per page field must be at least 1."
    ]
  }
}
```

Validation text can vary; use status codes and error keys for logic. The shared municipality middleware currently uses an Inertia restriction response for invalid municipality context, so a 403 body is not guaranteed to follow the JSON validation-error shape. Check HTTP status and Content-Type before decoding a response as the success contract.

## 10. Mobile acceptance checklist

- Load the correct municipality's facilities with the slug header.
- Handle empty lists, null optional fields and multiple pages.
- Open a facility detail page and display weekly periods and date updates.
- Show cancellation notices even while the regular weekly hours would be open.
- Keep uncertain delays closed after an estimated reopening time passes.
- Refresh across exact opening/closing times and when resuming the app.
- Display Manila schedules correctly when the device timezone differs.
- Handle deleted/unpublished detail records with a graceful 404 state.
- Support expired image URLs and network/offline states.
- Keep administrative controls outside this mobile feature.

Backend verification: 36 Facility tests passed when the mobile API was implemented, including public filtering, municipality isolation, JSON contracts, cancellation/delay output, pagination, method restrictions and opening-boundary refreshes.

Before production release, confirm the deployed host, municipality slug and that the backend version containing these endpoints is live.

