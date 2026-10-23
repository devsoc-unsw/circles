# Writing degree documents

This folder holds the degree documents that Circles evaluates: one YAML file per program,
specialisation, course-condition set, library and patch. The backend loads every file here into
Mongo at startup and serves them unchanged from `GET /degrees/documents`. The browser evaluates them
with `@circles/degree-eval`.

This guide covers everything needed to write or generate a document. The full specification, with
the evaluation algorithm, is `SCHEMA.md` in the circles-schema repository. Where the two differ,
SCHEMA.md wins. The machine-readable structure is `packages/degree-eval/test-data/schema.json`.

Contents:

1. [Workflow](#1-workflow)
2. [Files and paths](#2-files-and-paths)
3. [The document header](#3-the-document-header)
4. [Programs](#4-programs)
5. [Specialisations](#5-specialisations)
6. [Requirement nodes](#6-requirement-nodes)
7. [Selectors: sets of courses](#7-selectors-sets-of-courses)
8. [Conditions](#8-conditions)
9. [Double counting: shares, credit, substitutions, exemptions](#9-double-counting)
10. [Double and dual degrees](#10-double-and-dual-degrees)
11. [Course conditions](#11-course-conditions)
12. [Libraries](#12-libraries)
13. [Inheriting from an earlier year, and patches](#13-inheriting-from-an-earlier-year-and-patches)
14. [Checklist and common mistakes](#14-checklist-and-common-mistakes)

---

## 1. Workflow

1. Write or generate the YAML file at the right path (§2).
2. Validate the whole folder with the package CLI:

   ```sh
   cd packages/degree-eval
   npm ci && npm run build:cli
   node dist/degree-eval.mjs validate ../../backend/data/degree_documents
   ```

   It prints `ALL OK`, or one `ERROR:` line per problem with `file:line:column`, and exits 1. `info:`
   lines are not problems: for example, an option resolved to another year's document. CI runs the
   same command on every pull request.
3. Restart the backend to load the change. In development, `docker compose restart backend`. The
   `--dev` and `--overwrite-*` start-up modes reload this folder; users are kept.
4. Check the result in the app: set `VITE_DEGREE_EVAL=true` in `env/frontend.env` and open the
   progression checker for a user on that program.

---

## 2. Files and paths

There is one document per file. The backend reads a document's kind, year and code **from its
path**, and skips (with a warning) any `.yaml` file at another path.

| kind | path | identity |
|---|---|---|
| `program` | `<year>/programs/<code>.yaml` | program code and handbook year, e.g. `2026/programs/3778.yaml` |
| `specialisation` | `<year>/specialisations/<code>.yaml` | spec code and year, e.g. `2026/specialisations/COMPA1.yaml` |
| `course_conditions` | `<year>/conditions/<SUBJ>.yaml` | one entry per course; by convention one file per subject, e.g. `2026/conditions/COMP.yaml` |
| `library` | `<year>/library.yaml` | year |
| `patch` | `patches/<id>.yaml` | the patch `id` |

The `code` and `year` inside the file must match the path.

**Years.** A student is evaluated against the program document for their **commencement year**. If
there is none, the nearest earlier year is used, else the nearest later one, and the page says so.
Specialisations resolve at the program's resolved year, with the same fallback. A library resolves
to the nearest year **at or before** the document's year, with no later fallback. So a 2024 program
that uses `@sets` or `faculty:` codes needs a 2024 (or earlier) library.

---

## 3. The document header

Every document starts the same way:

```yaml
# 3778 Bachelor of Computer Science, handbook year 2026
# Source: https://www.handbook.unsw.edu.au/undergraduate/programs/2026/3778
schema_version: "1.0"
kind: program            # program | specialisation | course_conditions | library | patch
code: "3778"             # programs: 4 digits, quoted; specialisations: 6 characters, e.g. COMPA1
year: 2026               # handbook year
provenance:
  source: hand           # hand | scraped | patch | local (see below)
  url: https://www.handbook.unsw.edu.au/undergraduate/programs/2026/3778
  structure_version: "2026.03.001"   # the handbook's curriculum structure version
  retrieved: 2026-10-08
  status: complete       # complete | partial | draft
```

- `source`:
  - `scraped` for generator output. Name the generator in `generator:`, e.g.
    `generator: circles-gen/1.0`, and regenerate rather than hand-edit.
  - `hand` for a hand-written or reviewed document. A `hand` document replaces a `scraped` one with
    the same identity entirely.
  - `patch` is for patch documents.
  - `local` is for files a user loads in the browser; never use it here.
- `status: partial` when part of the handbook could not be represented. Explain what in
  `warnings: [..]` or in `info` nodes.
- `original:` fields hold verbatim handbook text. The evaluator ignores them, but reviewers rely on
  them, so include one on every node you transcribe.
- Keys starting with `x-` are ignored, for tooling metadata.
- YAML anchors (`&name` / `*name`) are allowed. Merge keys (`<<:`) are not. A file may be at most
  1 MB with at most 100 aliases.

---

## 4. Programs

```yaml
schema_version: "1.0"
kind: program
code: "3778"
year: 2026
title: Computer Science
career: ugrd                  # ugrd | pgrd | rsch
uoc: 144                      # total UOC; checked against the distinct UOC counted by the whole tree
duration_years: 3             # display only
awards: [Bachelor of Computer Science]
provenance: { ... }
requirements: [ ... ]         # the requirement tree (§6)
# optional:
sets: { name: selector }      # local named course sets (§7)
shares: [ ... ]               # §9
substitutions: [ ... ]        # §9
exemptions: [ ... ]           # §9
components: [ ... ]           # double/dual degrees (§10)
entry: condition              # admission rule; advisory, never blocks planning
classes:                      # award classes, checked top-down at completion; first match wins
  - { name: "Honours Class 1", require: "wam(85, in:major)" }
notes: [ "display-only text" ]
```

A complete example is `2026/programs/3778.yaml`: a disciplinary group holding the major slot, an
optional minor, a 36 UOC free-elective pool and a 12 UOC gen-ed pool.

---

## 5. Specialisations

```yaml
schema_version: "1.0"
kind: specialisation
code: COMPA1
year: 2026
title: Computer Science
spec_kind: major              # major | minor | honours | specialisation | stream (declare it; never inferred from the code)
uoc: 96                       # or a range, e.g. { min: 66, max: 72 }
provenance: { ... }
requirements: [ ... ]
# optional: sets, shares, substitutions, exemptions, entry, classes, notes, and
allowed_if: "program(3961, 3732)"   # only available in these programs; or "spec(MECHAH, AEROAH)"
```

A specialisation has no `career`, `duration_years`, `awards` or `components`; it takes these from the
program. When a student selects it, its requirements become a subtree under the program's spec slot
(§6.4).

**Convention:** an honours specialisation exposes its thesis courses as a `core` node with id
`thesis`, so programs can refer to `major/thesis`.

---

## 6. Requirement nodes

`requirements` is a list of nodes. Every node has:

| field | notes |
|---|---|
| `id` | **Required.** Lowercase letters, digits and `-`, starting with a letter or digit. Unique in the document. `root` is reserved. Derive it from the title (`computing-electives`), adding `-2` on a collision. Never use handbook sys_ids. |
| `kind` | One of the nine kinds below. |
| `title`, `note`, `original` | Display only. |
| `severity` | `error` (default) or `warning`. A failing warning node reports met with a warning; use it for "recommended" or "encouraged" rules. |

**Ranges.** `uoc`, `count` and `choose` take an integer, which means **exactly** that many, or
`{min, max}` with either bound. `uoc: 30` is a minimum *and* a cap; write `uoc: { min: 30 }` for "at
least 30 UOC".

There are nine kinds:

| kind | job | claims courses? |
|---|---|---|
| `group` | all of its children, or choose k of them | no (contains) |
| `core` | every listed item must be completed | yes |
| `pool` | N UOC and/or N courses from a set | yes |
| `spec` | a specialisation slot (major, minor, …) | no (contains) |
| `limit` | UOC over a set must stay in a range | no (counts) |
| `maturity` | a condition every matching course must meet when taken | no (checks) |
| `timing` | where courses sit in the plan | no (checks) |
| `check` | a condition at completion | no (checks) |
| `info` | text the evaluator cannot check | no |

A course is allocated to at most one `core` or `pool` (its "home") unless a share allows more (§9).
Checking nodes see every allocation and never consume one.

### 6.1 `group`

```yaml
- id: disciplinary
  kind: group
  title: Disciplinary Component
  uoc: { min: 96 }              # optional: distinct UOC counted inside the group
  children: [ ... ]
```

With `choose`, the group is a choice point. Only the chosen children are active; the others are
removed before allocation.

```yaml
- id: additional-specs
  kind: group
  choose: { min: 0, max: 1 }    # "optionally, one of the following"
  children:
    - { id: second-major, kind: spec, slot: major, options: [...], distinct_from: [{ node: major }] }
    - { id: minors, kind: spec, slot: minor, options: [...], count: { min: 1, max: 2 } }
```

Use this for "a minor plus 12 UOC, **or** a second major", "one of the following streams", and "GE,
or an external minor instead". If the student has not chosen, the evaluator picks the branch that
best fits their plan.

Do not use a group's `uoc` when only some of its courses count toward the total, such as "96 UOC of
Science courses". Use a `limit` with `from:` and `scope:` instead (§6.5).

### 6.2 `core`

```yaml
- id: core
  kind: core
  title: Core Courses
  uoc: 66                         # the declared total; display and lints only
  courses:
    - COMP1511
    - MATH1131 or MATH1141        # one of
    - COMP3121 or COMP3821
    - ENGG1000 and ENGG1001       # both (rare); don't mix "or" and "and" in one item
```

- Each item must be met by a passed or planned course. The node's UOC is never what satisfies it, so
  0 UOC required courses (ENGG4999, COMM0999, SCIF0000) work.
- Items are exact course codes. For patterns ("any level 3 COMP course"), use a `pool`.
- A catalogue equivalent of a listed course also satisfies the item (DPST1091 for COMP1511).

### 6.3 `pool`

```yaml
- id: computing-electives
  kind: pool
  title: Computing Electives
  from: "@cse_computing_electives"      # a selector (§7); quote it when it starts with @ (YAML reserves it)
  uoc: { min: 30 }                      # at least one of uoc / count
  count: { min: 1 }                     # optional range on the number of courses
  quotas:                               # optional sub-limits inside the pool
    - { from: "@vip", uoc: { max: 6 } }
  role: elective                        # elective (default) | gen_ed | free_elective
  overflow: false                       # true: also takes courses nothing else claimed
  priority: 0                           # reorder this document's pools; lower first
```

| handbook wording | write |
|---|---|
| "at least 30 UOC of the following" | `uoc: { min: 30 }` |
| "30 UOC of the following" (exactly) | `uoc: 30` |
| "one of the following" | `count: 1` |
| "up to 12 UOC of …" | `uoc: { max: 12 }` |
| free electives | `role: free_elective`, `from: any` (or narrower), `overflow: true` |
| general education | `role: gen_ed`, `from: gened and not (…)` |

Caps (`uoc.max`, `count.max`, quota maxima) are enforced while allocating, so a course that would
exceed one goes elsewhere.

### 6.4 `spec`: a specialisation slot

```yaml
- id: major
  kind: spec
  slot: major                     # major | minor | honours | specialisation | stream | any
  title: Majors
  options: [COMPA1, COMPD1, COMPI1]   # spec codes, patterns (COMP*1) or @spec_group
  count: 1                        # default: exactly one; { min: 0, max: 1 } for an optional slot
  default: COMPA1                 # used if the student picked none; must be in options
  uoc: 24                         # optional: overrides the selected spec's own uoc
  distinct_from: [{ node: major, by: title }]   # not the same spec as another slot; by: code (default) | title | subject
  counts_toward:                  # the spec's courses also fill these pools' status (§9)
    - free-electives
    - { node: gen-ed, courses: not @science }
```

- Every option should have a specialisation document for that year (or a nearby year). A missing one
  is a validation warning, and that spec is reported as not checked.
- The Circles planner stores the student's specs as a flat list. The app places each code into the
  first slot, in document order, whose `options` contain it. So list options exactly as Circles
  names the specs.

### 6.5 `limit`

```yaml
- id: max-level-1
  kind: limit
  title: Maximum Level 1 UOC
  from: level:1                   # selector
  uoc: { max: 60 }                # or { min: 96 }
  scope: root                     # default: this document's root (in a spec document, the spec)
  basis: counted                  # counted (default): courses allocated inside scope | planned: every planned course
```

A limit whose `scope` is an empty spec slot or an unchosen branch is inactive and does not affect its
parent. So `scope: minor` applies only when a minor is chosen.

### 6.6 `maturity`, `timing`, `check`, `info`

```yaml
- id: ge-maturity
  kind: maturity
  severity: warning
  applies_to: in:gen-ed           # selector; in:… means "courses counted in that node"
  require: uoc(48)                # condition, evaluated at each matching course's term

- id: fys-final-year
  kind: timing
  courses: "@business_fys"
  within_final_uoc: 48            # taken when ≤ 48 UOC of the program remain
  # other forms: term: first | last, same_term: true, consecutive: true, order: [A, B, C]

- { id: thesis-mark, kind: check, require: "grade(65, COMP4963)", severity: warning }

- id: industrial-training
  kind: info
  text: Complete 60 days of approved industrial training.
  confirm: true                   # unknown until the student confirms it; false (default) = display only
```

Use `info` for anything the evaluator cannot check: approvals, show-cause rules, advice. Use
`confirm: true` when the student must do something.

---

## 7. Selectors: sets of courses

Selectors appear in `from`, `applies_to`, `courses` (timing, shares), quotas and `uoc(…, sel)`.

| atom | meaning |
|---|---|
| `COMP1511` | that course |
| `COMP3***`, `****1***`, `GEN*****` | a pattern: `*` is one character (letters in 1–4, digits in 5–8) |
| `level:3` | first digit of the course number is 3 |
| `faculty:ENG`, `school:CSE` | owning faculty or school, by **library code** (§12) |
| `career:ugrd` | ugrd, pgrd or rsch |
| `gened` | the course is a General Education course |
| `attr:wil` | a catalogue attribute |
| `@name` | a named set: the document's `sets`, else the library's |
| `any` | every course |
| `in:node-path` | courses **allocated** to that node. Only in `limit`, `maturity`, `timing`, `check` and `classes`; never in `pool.from` or `cores()` |

Combine with `or`, `and`, `not` and parentheses. A YAML list means `or`. **Mixing `and` and `or` at
one level is an error**: write `(A and B) or C`, never `A and B or C`.

```yaml
from: gened and not (MATH**** or DATA****)                 # 3778 GE
from: any and not GEN*****                                 # free electives, excluding GEN courses
from: [COMP2041, COMP2111, "@vip", COMP3***, COMP4***]     # list form
```

**Named sets.** Put reusable sets in the library (`sets:`), or in a document's own `sets:` when only
it uses them. A local name may not reuse a library name.

**Node paths** (used by `in:`, `scope`, `counts_toward`, `shares.between`, `complete()`):

| form | meaning |
|---|---|
| `root` | the document root |
| `free-electives` | the node with that id |
| `major` | whatever is selected in the spec slot `major` |
| `major/COMPA1` | spec COMPA1's subtree in that slot |
| `major/COMPA1/core` | node `core` inside COMPA1 |
| `major/thesis` | node `thesis` in whichever spec is selected |
| `spec:ACCTA1` | whichever slot holds ACCTA1 |
| `eng/major` | a node inside component `eng` of a double degree (§10) |

---

## 8. Conditions

Conditions appear in `require`, `entry`, `allowed_if`, `classes[].require`, `when` and course
`requires` (§11).

| atom | true when |
|---|---|
| `COMP1511` | COMP1511 (or an equivalent) is completed **before** this term |
| `coreq(COMP1511)` | … completed before or **in** this term |
| `planned(COMP1511)` | it appears anywhere else in the plan (used for exclusions) |
| `uoc(102)`, `uoc(18, COMP****)` | at least N UOC completed (of courses matching the selector) |
| `wam(65)`, `wam(70, level:3)` | WAM at least N (over matching courses) |
| `grade(65, MATH1231)`, `grade(65, in:major/thesis)` | best mark in that course, or matching courses, at least N |
| `cores()`, `cores(level:2)` | every core course (of that level) is completed |
| `complete(arts)` | the node at that path is met |
| `reported_wam(65, prior_program)` | a WAM the student enters, for marks the plan can't compute |
| `program(3778, @bcom)` | the student's program, or one of its components, is in the list |
| `spec(COMP*1, COMPBH)` | a selected spec matches |
| `manual("text")` | unknown until the student confirms it |
| `true`, `false` | constants |

Combine with `and`, `or`, `not` and parentheses, with the same no-mixing rule. Marks are 0–100.

Which atoms are allowed where:

| context | allowed |
|---|---|
| course `requires`, `excludes` | everything except `in:` and `complete()` |
| `maturity.require` | everything |
| `check.require`, `classes[].require` | everything |
| `entry`, `allowed_if`, `when` | only `program`, `spec`, `manual`, `wam`, `reported_wam`, `true`, `false` |

Translating today's Circles tokens:

| today | write |
|---|---|
| `COMP1511 && (COMP2521 \|\| COMP1927)` | `COMP1511 and (COMP2521 or COMP1927)` |
| `[COMP1511]` (corequisite) | `coreq(COMP1511)` |
| `102UOC`, `24UOC in L2 MATH` | `uoc(102)`, `uoc(24, level:2 and MATH****)` |
| `80WAM in F Business` | `wam(80, faculty:BUS)` |
| `65GRADE in MATH1231` | `grade(65, MATH1231)` |
| `L2 CORES` | `cores(level:2)` |
| `COMP#`, `COMP?1` | `program(@cse_programs)`, `spec(COMP*1)` |

Anything the handbook says that you cannot express becomes `manual("…the handbook text…")`. Never
guess.

---

## 9. Double counting

By default a course counts toward exactly one `core` or `pool`: the first one in document order
(pre-order) that accepts it. Four mechanisms change that. They all live at document level, next to
`requirements`.

**Shares**, for when the handbook allows a course to count in two places:

```yaml
shares:
  - between: [major, second-major]  # two node paths; whole subtrees allowed
    courses: not @ify               # optional: only these courses
    max_uoc: 6                      # optional budget (mode: both only)
    targets: any                    # any (default) | core: may satisfy core items only
    mode: both                      # both (default): counts on both sides
                                    # replace: counts once; the other side needs a replacement elective
    replacement: { level: same_or_higher }   # mode: replace only; optional `from:` selector
```

If two spec subtrees both need the same course and no share covers the pair, the evaluator reports
the requirement as unknown, not unmet. So declare a share whenever the handbook allows the overlap,
and say in a `note` when it is silent.

**Credit** (`counts_toward` on a spec slot, §6.4): "an optional minor may use your free electives".
The minor's courses also fill the free-elective pool's status without being counted twice.

**Substitutions**, for "X may replace Y":

```yaml
substitutions:
  - { replace: ENGG1811, with: COMP1511, scope: eng }       # scope: node path; default: whole tree
  - { replace: MATH1081, with: MATH2***, when: "manual(\"Approved by the school\")" }
```

**Exemptions**, for "students in X do not take Y":

```yaml
exemptions:
  - { courses: [COMM1110], scope: commerce }   # reduce_uoc: true (default) lowers the declared UOC too
```

---

## 10. Double and dual degrees

A double degree composes existing programs instead of copying them:

```yaml
kind: program
code: "3785"
year: 2027
uoc: 240
components:
  - id: eng
    program: "3707"               # resolved at this document's year (or the component's `year:`)
    uoc: { min: 168 }
    include: [disciplinary]       # keep only these top-level nodes; omit for everything
    patch:                        # ops on the component's own ids (§13)
      - { op: list_remove, target: major, field: options, items: [BINFAH, COMPBH] }
  - id: cs
    program: "3778"
    uoc: { min: 96 }
    include: [disciplinary]
requirements:                     # extras at the double-degree level
  - { id: additional-electives, kind: pool, role: free_elective, from: faculty:ENG or school:CSE, uoc: { min: 0 }, overflow: true }
shares: [ { between: [eng, cs], targets: core } ]
```

- Each component becomes a group named by its `id`; paths inside it are `eng/major` and so on.
- Component programs must not have components themselves.
- Sharing between components is off unless a `shares` entry declares it.
- How imported components should behave is still an open question in the spec. It changes results
  for 4053 and 4770, so mark such documents `status: partial` until it is settled.

---

## 11. Course conditions

```yaml
schema_version: "1.0"
kind: course_conditions
year: 2026
provenance: { source: scraped, generator: circles-conditions/2.0, retrieved: 2026-10-08 }
courses:
  COMP1511:
    status: none                  # no prerequisite; then `requires` must be absent
    excludes: [COMP1911, WENG1000]
  COMP3311:
    original: "Prerequisite: COMP2521 or COMP1927"
    status: parsed                # parsed | partial | manual | unparsed | none
    requires: COMP2521 or COMP1927
    excludes: [INFS5992, INFS1603, COMP9311]
  COMP1911:
    status: parsed
    excludes:
      - COMP1511
      - spec(COMP*1, COMP*H, SENG*1, SENG*H)   # "not in a CSE major"
```

- `status` describes `requires` only. `excludes` always applies.
- `excludes` items are exact course codes, `spec(…)` or `program(…)`, never patterns.
- Use `partial` with `manual("…")` atoms for the parts you could not parse, and `unparsed` (with
  `original`) when nothing parsed. Both show as unknown rather than guessed.
- Course facts (UOC, level, faculty, school, gen-ed, equivalents) are **not** written here; they come
  from the course catalogue.

---

## 12. Libraries

One per year, at `<year>/library.yaml`. It holds the names other documents use:

```yaml
schema_version: "1.0"
kind: library
year: 2026
provenance: { source: hand, status: partial }
faculties:
  ENG: { name: Faculty of Engineering }
  SCI: { name: Faculty of Science }
  ADA: { name: "Faculty of Arts, Design & Architecture" }
schools:
  CSE: { name: School of Computer Science and Engineering, faculty: ENG }
sets:
  vip: ENGG2600 or ENGG3600 or ENGG4600
  cse_computing_electives: COMP2041 or COMP2111 or @vip or COMP3*** or COMP4*** or COMP6*** or COMP9***
program_groups:
  cse_programs: ["3778", "3779", "3707"]
spec_groups:
  science_majors: [CHEM*1, MATH*1, PHYS*1]
```

**Faculty and school names must match the handbook's names.** The app finds each course's faculty
and school codes by comparing these `name`s with the names in Circles' course data. It ignores case
and punctuation and treats `&` as `and`. A faculty or school missing here, or named differently,
matches no course, so `faculty:` and `school:` rules ignore that course. When you generate a library,
list every faculty and school, with names copied from the handbook.

---

## 13. Inheriting from an earlier year, and patches

**`extends`** writes a program or specialisation as a diff from an earlier year of the same code:

```yaml
kind: program
code: "3778"
year: 2027
extends: { year: 2026 }
provenance: { source: hand, url: …/2027/3778, structure_version: "2027.01.001" }
patch:
  - { op: list_add, target: minor, field: options, items: [AVIAF2] }
```

Top-level fields override the base. `requirements`, if given, replaces the base list wholesale. Then
`patch` ops apply in order. This only works if node ids are stable between years, so generate ids
deterministically.

**Patch documents** fix one document (often scraped data) without editing it, with a guard that
reports the patch as **stale** once the handbook text changes:

```yaml
schema_version: "1.0"
kind: patch
id: comp3900-enrolment
target: { kind: course_conditions, years: { from: 2024, to: 2027 } }   # add code: for program/spec targets
expect: { COMP3900.original: "Prerequisite: COMP1531, and …" }         # exact text (whitespace-normalised)
reason: Why this fix exists.
provenance: { source: patch, authors: [your-name], reviewed: 2026-10-08 }
ops:
  - { op: set, target: COMP3900, fields: { requires: "COMP1531 and (COMP2521 or COMP1927)", status: parsed } }
```

The ops are a closed set, shared by `extends`, component `patch` and patch documents:

| op | fields | effect |
|---|---|---|
| `set` | `target`, `fields` | merge fields into a node, `root`, or a course entry |
| `remove` | `target` | delete a node and its subtree |
| `replace` | `target`, `node` | replace a node, keeping its id |
| `add` | `parent`, `node`, `before?`/`after?` | insert into `parent.children` (`root` means `requirements`) |
| `list_add` / `list_remove` | `target`, `field`, `items` | edit a list such as `options`, `courses`, list-form `from` or `excludes` |

---

## 14. Checklist and common mistakes

Before committing:

- [ ] The path matches the kind, code and year inside the file (§2).
- [ ] `node dist/degree-eval.mjs validate ../../backend/data/degree_documents` prints `ALL OK`.
- [ ] Every transcribed node has `original:` with the handbook text.
- [ ] `provenance` has `source`, `url`, `structure_version`, `retrieved` and an honest `status`.
- [ ] Every spec option has a specialisation document (or the warning is expected).
- [ ] Every `faculty:`, `school:` and `@set` used is in that year's library.

Mistakes the validator catches, and how to fix them:

| mistake | fix |
|---|---|
| `A and B or C` | add parentheses: `(A and B) or C` |
| a pattern (`COMP3***`) in a `core` item | use a `pool` |
| `in:` in a `pool.from` | `in:` only in limit, maturity, timing, check, classes |
| duplicate node `id` | ids are unique per document; add a suffix |
| `default` not in `options` | add it to `options` |
| `status: none` with `requires` | remove `requires`, or use `parsed` |
| a pattern in `excludes` | exact codes, `spec(…)` or `program(…)` only |
| unknown `@set` | define it in `sets` or the library |
| `wam(650)` | marks are 0–100 |

Mistakes the validator does **not** catch, so check them by hand or in the app:

| mistake | effect | fix |
|---|---|---|
| `uoc: 30` for "at least 30 UOC" | the pool also caps at 30; extra courses go elsewhere | `uoc: { min: 30 }` |
| a free-elective pool without `overflow: true` | leftover courses count nowhere | add `overflow: true` |
| no `share` where the handbook allows an overlap | the overlapping requirement shows unknown | declare the share |
| a faculty name not matching the handbook | `faculty:` rules match nothing | copy the name exactly |
| meaning inferred from a title or code suffix | nothing; titles are display only | use `kind`, `spec_kind`, `role` |
| a guessed rule | a confident wrong answer | `info` or `manual("…")` instead |
