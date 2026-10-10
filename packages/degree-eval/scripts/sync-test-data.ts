// Vendors the circles-schema data the tests run against into test-data/ (see README.md).
// Usage: node scripts/sync-test-data.ts --from <circles-schema dir>
// Never hand-edit test-data/: re-run this script instead. The source folder is only read.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(packageDir, 'test-data');

// [source path relative to --from, destination relative to test-data/]
const SOURCES: [string, string][] = [
  ['schema.json', 'schema.json'],
  ['examples', 'examples'],
  ['fixtures', 'fixtures'],
  ['tools/negative', 'negative'],
  ['tools/positive', 'positive']
];
const COPIED = /(\.ya?ml|^expected\.txt|^schema\.json)$/;
const SUMMARY =
  /Validated (\d+) documents.*?; (\d+) compact strings\/items parsed; (\d+) parse->print->parse/;

const fail = (msg: string): never => {
  console.error(`sync-test-data: ${msg}`);
  process.exit(1);
};

const walk = (path: string): string[] =>
  statSync(path).isDirectory()
    ? readdirSync(path)
        .sort()
        .flatMap((f) => walk(join(path, f)))
    : [path];

// JSON with object keys sorted at every level, so SOURCE.json diffs stay stable
const sortKeys = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, sortKeys((v as Record<string, unknown>)[k])])
    );
  }
  return v;
};

const fromIdx = process.argv.indexOf('--from');
const fromArg = fromIdx >= 0 ? process.argv[fromIdx + 1] : undefined;
if (!fromArg) fail('usage: node scripts/sync-test-data.ts --from <circles-schema dir>');
const from = resolve(fromArg as string);

// 1. validate.mjs must pass on the source before anything is copied
const run = spawnSync(process.execPath, [join(from, 'tools', 'validate.mjs')], {
  cwd: from,
  encoding: 'utf8'
});
if (run.status !== 0) fail(`validate.mjs exited ${run.status}:\n${run.stdout}${run.stderr}`);
const m = SUMMARY.exec(run.stdout.split('\n')[0] ?? '');
if (!m) fail(`cannot read the validate.mjs summary line: ${run.stdout.split('\n')[0]}`);
const [, documents, parsed, roundTrips] = (m as RegExpExecArray).map(Number);

// 2. replace test-data/ with a fresh copy
if (relative(packageDir, outDir).startsWith('..') || !outDir.endsWith(`${sep}test-data`)) {
  fail(`refusing to delete ${outDir}`);
}
rmSync(outDir, { recursive: true, force: true });
const files: Record<string, string> = {};
for (const [src, dest] of SOURCES) {
  const srcPath = join(from, src);
  for (const file of walk(srcPath)) {
    const name = file.split(sep).pop() ?? '';
    if (COPIED.test(name)) {
      const rel = join(dest, relative(srcPath, file)).split(sep).join('/');
      const target = join(outDir, rel);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(file, target);
      files[rel] = createHash('sha256').update(readFileSync(target)).digest('hex');
    }
  }
}

// 3. record where it came from, the reference counts and a hash per file
const source = {
  source: from,
  syncedAt: new Date().toISOString(),
  validate: { documents, parsed, roundTrips },
  files
};
writeFileSync(join(outDir, 'SOURCE.json'), `${JSON.stringify(sortKeys(source), null, 2)}\n`);
console.log(
  `sync-test-data: ${Object.keys(files).length} files; validate: ${documents} documents, ${parsed} parsed, ${roundTrips} round trips`
);
