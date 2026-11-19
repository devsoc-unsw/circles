// degree-eval: Node CLI over the package (M8). A successor to circles-schema tools/validate.mjs,
// plus a conformance runner and a readable evaluation report, for data repositories and authors.
//
//   degree-eval validate <docs-dir> [--fixtures <dir>] [--root <dir>]
//   degree-eval fixtures <fixture.yaml | dir>... [--root <dir>]
//   degree-eval evaluate <fixture.yaml> [--root <dir>]
//
// Paths in messages, and fixture `bundle.documents` paths, are relative to --root (default: the
// current directory), as in validate.mjs.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import type { Diagnostic, Evaluation, Fixture, NodeResult, TextFile } from '../src';
import { compareFixture, formatDiagnostic, parseYaml, runFixture, validateSources } from '../src';

const USAGE = `usage:
  degree-eval validate <docs-dir> [--fixtures <dir>] [--root <dir>]
  degree-eval fixtures <fixture.yaml | dir>... [--root <dir>]
  degree-eval evaluate <fixture.yaml> [--root <dir>]`;

const walk = (path: string): string[] =>
  statSync(path).isDirectory() ? readdirSync(path).flatMap((f) => walk(join(path, f))) : [path];

const yamlUnder = (paths: string[]) =>
  paths.flatMap((p) => walk(p).filter((f) => /\.ya?ml$/.test(f))).sort();

const parseArgs = (argv: string[]) => {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? '';
    if (a.startsWith('--')) {
      flags[a.slice(2)] = argv[i + 1] ?? '';
      i += 1;
    } else positional.push(a);
  }
  return { positional, flags };
};

const out = (line = '') => process.stdout.write(`${line}\n`);

const range = (n: NodeResult) => {
  const r = n.required_uoc;
  if (!r) return '';
  if (r.min !== undefined && r.min === r.max) return `/${r.min}`;
  return `/${r.min ?? 0}${r.max !== undefined ? `–${r.max}` : '+'}`;
};

const printTree = (ev: Evaluation) => {
  out(`${ev.program.code} (${ev.program.year})${ev.program.title ? ` ${ev.program.title}` : ''}`);
  const visit = (path: string, depth: number) => {
    const n = ev.nodes.get(path);
    if (!n || n.inactive) return;
    const credit = n.credited_uoc ? ` +${n.credited_uoc} credited` : '';
    const auto = n.autoSelected?.length ? ` [auto: ${n.autoSelected.join(', ')}]` : '';
    out(
      `${'  '.repeat(depth)}${n.id}  ${n.status}${n.projected ? ' (projected)' : ''}  ${n.counted_uoc}${range(n)} UOC${credit}${auto}`
    );
    for (const r of n.reasons) out(`${'  '.repeat(depth + 2)}- ${r.code}: ${r.text}`);
    for (const c of n.children) visit(c, depth + 1);
  };
  visit(ev.root.path, 0);
  if (ev.notCounted.length) out(`not counted: ${ev.notCounted.join(', ')}`);
};

const main = (argv: string[]): number => {
  const [command, ...rest] = argv;
  const { positional, flags } = parseArgs(rest);
  const root = resolve(flags.root ?? '.');
  const rel = (f: string) => relative(root, resolve(f)).split(sep).join('/');
  const textFile = (f: string): TextFile => ({ path: rel(f), text: readFileSync(f, 'utf8') });
  const read = (p: string) => {
    const abs = join(root, p);
    return existsSync(abs) ? readFileSync(abs, 'utf8') : undefined;
  };
  const loadFixture = (f: string) => parseYaml(readFileSync(f, 'utf8')) as Fixture;

  if (command === 'validate' && positional.length === 1) {
    const docs = yamlUnder(positional).map(textFile);
    const fixtures = flags.fixtures ? yamlUnder([flags.fixtures]).map(textFile) : [];
    const r = validateSources(docs, fixtures, read);
    out(
      `Validated ${r.documents} documents against schema.json; ${r.stats.parsed} compact strings/items parsed; ${r.stats.roundTrips} parse->print->parse round trips identical.`
    );
    if (flags.fixtures)
      out(`Checked ${r.fixtures} conformance fixtures (shape, bundle, plan, paths).`);
    // semantic warnings already carry "file: " in their message, as validate.mjs prints them
    for (const w of r.warnings)
      out(`info: ${w.message.startsWith(`${w.file}: `) ? w.message : formatDiagnostic(w)}`);
    for (const e of r.errors) out(`ERROR: ${formatDiagnostic(e)}`);
    out(r.errors.length ? `FAILED (${r.errors.length} errors)` : 'ALL OK');
    return r.errors.length ? 1 : 0;
  }

  if (command === 'fixtures' && positional.length > 0) {
    let failed = 0;
    for (const f of yamlUnder(positional)) {
      const fx = loadFixture(f);
      const { evaluation, diagnostics } = runFixture(fx, read);
      const problems = [
        ...diagnostics.filter((d: Diagnostic) => d.level === 'error').map(formatDiagnostic),
        ...compareFixture(fx, evaluation)
      ];
      out(`${problems.length ? 'FAIL' : 'PASS'} ${fx.id} (${rel(f)})`);
      for (const p of problems) out(`  ${p}`);
      if (problems.length) failed += 1;
    }
    out(failed ? `FAILED (${failed} fixtures)` : 'ALL OK');
    return failed ? 1 : 0;
  }

  if (command === 'evaluate' && positional.length === 1) {
    const fx = loadFixture(positional[0] ?? '');
    const { evaluation: ev, diagnostics } = runFixture(fx, read);
    for (const d of diagnostics) out(`${d.level}: ${formatDiagnostic(d)}`);
    printTree(ev);
    return 0;
  }

  out(USAGE);
  return 2;
};

process.exitCode = main(process.argv.slice(2));
