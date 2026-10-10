# @circles/degree-eval

Loads, resolves and evaluates Circles degree YAML (programs, specialisations, course conditions,
libraries, patches) in the browser or in Node, with no server. M0–M1 contain the compact
condition/selector language (`src/lang/`); loading, resolution and evaluation come in later
milestones. The design lives in `circles-schema/EVALUATOR.md` and `SPEC-M0-M1.md`.

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

## Install

Run `npm ci` here **and** in `frontend/`: npm does not install a `file:` dependency's own
dependencies. After any dependency change here, also run `npm install` in `frontend/` so its
lockfile entry for the link stays accurate (`npm ci` does not check this).

## Test data

`test-data/` is a copy of circles-schema's `schema.json`, `examples/`, `fixtures/`,
`tools/negative/` and `tools/positive/`. Never edit it by hand. To update it:

```bash
npm run sync-test-data -- --from /path/to/circles-schema
npm test
```

The script runs `tools/validate.mjs` first (it must pass), then rewrites `test-data/` and
`test-data/SOURCE.json` (file hashes plus the reference parse counts). The body tests read their
expected counts from `SOURCE.json`, so a re-sync updates them together. When the schema data moves
into this repo, delete `test-data/` and point the test helpers at the new location.
