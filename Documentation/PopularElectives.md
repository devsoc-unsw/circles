# Popular Electives

Circles marks the electives that students on your degree most often have in their plan. A flame appears next to them in the Course Selector sidebar, and a "Popular course" label appears on the course page. Hovering either shows how many students have the course planned.

## How popularity is worked out

For a student on program `P` with specialisations `S`:

1. **Pick the group.** Take every user who has finished degree setup, is enrolled in program `P`, is enrolled in all of the specialisations `S`, and has **not** opted out of data sharing. This group's size is the `sampleSize`.
2. **Check the group is big enough.** If fewer than **20** students are in the group, show nothing. Small groups give noisy, misleading results, and could hint at what a specific person picked.
3. **Count.** For each course, count how many students in the group have it anywhere in their plan (planned into a term or still unplanned).
4. **Keep electives only.** Drop core courses, general education, and rule-based groups. Only courses in elective groups of `P`/`S` can be popular. A course that is core anywhere in the degree is dropped, even if another list also offers it as an elective (for example COMP1511 in 3154 is COMPZ1 core and also in "Science Electives").
5. **Rank.** Sort by count, highest first, and keep the top **5**.

Constants live in `backend/server/routers/courses.py`: `MIN_POPULAR_SAMPLE = 20`, `POPULAR_LIMIT = 5`.

### API

`GET /courses/popularElectives/{programCode}` or `GET /courses/popularElectives/{programCode}/{spec1+spec2}`

```json
{
  "programCode": "3778",
  "sampleSize": 24,
  "popular": [{ "courseCode": "COMP3311", "count": 23, "percent": 0.96 }]
}
```

The response only contains totals. It never contains user IDs, names, or marks.

## Opting out ("Share Course Data")

Each user has a `settings.shareCourseData` flag in Mongo (`users` collection).

| Value | Meaning |
| --- | --- |
| `true` | The user's plan is counted. |
| `false` | The user is left out of both the counts and `sampleSize`. |
| missing | Treated as `true`. All accounts created before this setting existed have no value. |

This is **opt-out**: everyone is counted unless they turn it off.

Where users choose:

- **During setup:** a checkbox on the last step of the degree wizard, ticked by default.
- **Afterwards:** Term Planner, settings (gear icon), "Share Course Data" switch.

### Telling users (one-time notice)

Everyone is counted by default, so every user is told about it once:

- **New users** read the explanation next to the checkbox on the last setup step. Finishing setup saves `settings.shareNoticeSeen = true`.
- **Existing users** (accounts made before the notice, so `shareNoticeSeen` is missing) get a one-time popup on their first page after login. It explains the stats and how to turn sharing off (Term Planner, gear icon, "Share Course Data").
  - "Got it" or closing the popup calls `POST /user/settings/dismissShareNotice`. Sharing stays on.
  - "Turn off sharing" calls the toggle, which also marks the notice as seen.
- Existing users are counted while the popup is still unseen.

Turning it off takes effect on the next popularity request. There is no stored copy of the counts to clear.

### Implementation notes

- The popularity query filters on `"settings.shareCourseData": {"$ne": false}`, which matches both `true` and a missing value.
- The users collection has a strict schema validator (`_USERS_VALIDATOR` in `backend/server/db/mongo/setup.py`). On startup the backend re-applies it to an existing collection with `collMod`, so existing deployments accept the new field without a manual migration.
- Exported plan files (`frontend/src/utils/export.ts`) default the flag to `true` when importing older exports.

## Tests

- `backend/server/tests/courses/test_popular_electives.py`: grouping, elective filter, sample floor, top 5 cap, and opt-out exclusion.
- `backend/server/tests/user/test_share_course_data.py`: wizard default, wizard opt-out, toggle, import, the one-time notice flag, and that both endpoints need a login.

Both suites need the seeded backend running. CI starts it with `docker compose up --wait ci-backend` (see `.github/workflows/ci.yml`).
