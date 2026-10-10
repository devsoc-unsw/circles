import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const TEST_DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'test-data');

export interface Source {
  source: string;
  syncedAt: string;
  validate: { documents: number; parsed: number; roundTrips: number };
  files: Record<string, string>;
}

export const readSource = (): Source =>
  JSON.parse(readFileSync(join(TEST_DATA, 'SOURCE.json'), 'utf8')) as Source;

const walk = (path: string): string[] =>
  statSync(path).isDirectory() ? readdirSync(path).flatMap((f) => walk(join(path, f))) : [path];

// every vendored file except SOURCE.json, as sorted '/'-separated paths relative to test-data/
export const listTestData = (dir = ''): string[] =>
  walk(join(TEST_DATA, dir))
    .map((f) => relative(TEST_DATA, f).split(sep).join('/'))
    .filter((f) => f !== 'SOURCE.json')
    .sort();

export const listYaml = (dir: string): string[] =>
  listTestData(dir).filter((f) => /\.ya?ml$/.test(f));

// Plain YAML load for tests; the untrusted-input limits of validate.mjs's loadYaml are M2 work.
export const loadYaml = (rel: string): unknown =>
  YAML.parse(readFileSync(join(TEST_DATA, rel), 'utf8'), { merge: false });
