# @circles/degree-eval

Loads, resolves and evaluates Circles degree YAML (programs, specialisations, course conditions,
libraries, patches) in the browser or in Node. The backend stores and serves the documents as YAML
text; this package loads, checks and (in later milestones) evaluates them client-side.

- `src/lang/` (M1): the compact condition/selector language: parse, print, normalise.
- `src/load/` (M2): `loadDocuments(files)`: YAML under the size/alias/merge-key limits,
  `schema_version` handling, schema validation and a parse check of every compact string.
- `src/validate/` (M2): schema validators **generated** from `schema.json` by Ajv's standalone mode
  (`src/validate/generated/`, committed; never edit by hand). Ajv is a build-time dependency only.
- `src/resolve/`, `src/ir/` (M3): which document wins, year fallback, `extends`, patches (with
  stale reporting), components, spec expansion and node paths.
- `src/eval/` (M4–M7): `evaluate(bundle, student)` runs the §7.4 allocation and §7.6 statuses;
  `checkInstance`/`unlockedAt` give course unlock results (§7.7); `explain` returns the trace.
- `src/validate/semantic.ts` (M8): cross-reference checks and lints (`checkDocs`, `checkFixture`).

The 10 conformance fixtures run in `test/conformance.test.ts`. Rulings where the spec is silent are
in `DECISIONS.md`. The design lives in `circles-schema/EVALUATOR.md` and `SPEC-M0-M1.md`.

The package is **source-only** (`exports` points at `src/index.ts`; there is no build step). The
frontend depends on it as `"@circles/degree-eval": "file:../packages/degree-eval"` and Vite/Vitest
alias it to `src/` for hot reload. `src/` must not use Node or DOM APIs.

## Scripts

| script | what |
|---|---|
| `npm test` / `npm run test:watch` | Vitest (`test/**/*.test.ts`) |
| `npm run lint` / `lint:fix` / `format` | ESLint + Prettier (same rules as the frontend, minus React) |
| `npm run types` | `tsc` for `src/` (no ambient types) and for tests/scripts (Node types) |
| `npm run sync-test-data -- --from <dir>` | re-vendor `test-data/` from a circles-schema checkout |
| `npm run build-validators` | regenerate `src/validate/generated/` from `test-data/schema.json` |

## Install

Run `npm ci` here **and** in `frontend/`: npm does not install a `file:` dependency's own
dependencies. After any dependency change here, also run `npm install` in `frontend/` so its
lockfile entry for the link stays accurate (`npm ci` does not check this).

## Test data

`test-data/` is a copy of circles-schema's `schema.json`, `examples/`, `fixtures/`,
`tools/negative/` and `tools/positive/`. Never edit it by hand. To update it:

```bash
npm run sync-test-data -- --from /path/to/circles-schema
npm run build-validators   # only needed when schema.json changed; a test fails until it is run
npm test
```

The script runs `tools/validate.mjs` first (it must pass), then rewrites `test-data/` and
`test-data/SOURCE.json` (file hashes plus the reference parse counts). The body tests read their
expected counts from `SOURCE.json`, so a re-sync updates them together. When the schema data moves
into this repo, delete `test-data/` and point the test helpers at the new location.
