# Popular Electives

Circles marks the electives that students on your degree most often have in their plan. A flame appears next to them in the Course Selector sidebar, and a "Popular course" label appears on the course page. Hovering either shows how many students have the course planned.

## How popularity is worked out

For a student on program `P` with specialisations `S`:

1. **Pick the group.** `P` and `S` always come from the logged-in student's own saved degree. Take every user who has finished degree setup, is enrolled in program `P`, is enrolled in all of the specialisations `S`, and has **not** opted out of data sharing. This group's size is the `sampleSize`.
2. **Check the group is big enough.** If fewer than **20** students are in the group, show nothing, not even the group size (`sampleSize` is returned as `0`). Small groups give noisy, misleading results, and could hint at what a specific person picked.
3. **Count.** For each course, count how many students in the group have it anywhere in their plan (planned into a term or still unplanned).
4. **Keep electives only.** Drop core courses, general education, and rule-based groups. A group counts as core if its title contains "core" or its type is `core_courses` (many program-level core groups, like "Final Year Synthesis (FYS)", have no "core" in the title). Only courses in elective groups of `P`/`S` can be popular. A course that is core anywhere in the degree is dropped, even if another list also offers it as an elective (for example COMP1511 in 3154 is COMPZ1 core and also in "Science Electives").
5. **Rank.** Sort by count, highest first, with ties broken by course code so the list is stable, and keep the top **5**.

Constants live in `backend/server/routers/courses.py`: `MIN_POPULAR_SAMPLE = 20`, `POPULAR_LIMIT = 5`.

### API

`GET /courses/popularElectives` (needs a login; the server uses the caller's own program and specialisations, so nobody can probe other, possibly tiny, groups)

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
- **Afterwards:** Term Planner, settings (gear icon), "Share Course Data" switch. It calls `PUT /user/settings/shareCourseData` with the new value. It sets the value rather than flipping it, so a double click or a second tab can never turn sharing back on.

### Telling users (one-time notice)

Everyone is counted by default, so every user is told about it once:

- **New users** read the explanation next to the checkbox on the last setup step. Finishing setup saves `settings.shareNoticeSeen = true`.
- **Existing users** (accounts made before the notice, so `shareNoticeSeen` is missing) get a one-time popup on their first page after login. It explains the stats and how to turn sharing off (Term Planner, gear icon, "Share Course Data").
  - "Keep sharing" or closing the popup calls `POST /user/settings/dismissShareNotice`. Sharing stays on.
  - "Turn off sharing" calls `PUT /user/settings/shareCourseData` with `{"shareCourseData": false}`, which also marks the notice as seen.
  - Both buttons have equal weight, so neither choice is pushed.
  - If the user changes the setting elsewhere while the popup is open, it closes.
- Existing users are counted while the popup is still unseen.

Turning it off takes effect on the next popularity request. There is no stored copy of the counts to clear.

### Implementation notes

- The popularity query filters on `"settings.shareCourseData": {"$ne": false}`, which matches both `true` and a missing value.
- The users collection has a strict schema validator (`_USERS_VALIDATOR` in `backend/server/db/mongo/setup.py`). On startup the backend re-applies it to an existing collection with `collMod`, so existing deployments accept the new field without a manual migration.
- Exported plan files (`frontend/src/utils/export.ts`) default the flag to `true` when importing older exports.

## Tests

- `backend/server/tests/courses/test_popular_electives.py`: login required, caller's own degree, grouping, elective filter (including program-level core groups), sample floor, top 5 cap, tie order, and opt-out exclusion.
- `backend/server/tests/user/test_share_course_data.py`: wizard default, wizard opt-out, setting the value (and that repeating it keeps it off), import, the one-time notice flag, and that both endpoints need a login.

Both suites need the seeded backend running. CI starts it with `docker compose up --wait ci-backend` (see `.github/workflows/ci.yml`).
