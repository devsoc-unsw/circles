/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment,
   @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return --
   a line-for-line port of tools/validate.mjs checkDocs/checkFixtures over untyped YAML data, kept
   close to the original so the two can be diffed; messages are verbatim (tools/negative). */
// Semantic validation (SCHEMA.md §11 layer 3): cross-references, context rules and lints.
import { analyzeCondition } from '../lang/condition';
import { RX } from '../lang/patterns';
import { analyzeSelector } from '../lang/selector';
import type { Diagnostic } from '../load';

const ITEM = /^[A-Z*]{4}[0-9*]{4}(( or [A-Z*]{4}[0-9*]{4})*|( and [A-Z*]{4}[0-9*]{4})*)$/;

export interface SemanticDoc {
  file: string;
  d: any;
}

export interface SemanticResult {
  errors: Diagnostic[];
  warnings: Diagnostic[];
  findDoc: (kind: string, code: unknown, year: number) => SemanticDoc | undefined;
  resolvedBase: (bd: any) => any;
  nodesOf: (list: any) => any[];
}

const parseSelRaw = (s: string) => analyzeSelector(s);
const parseCond = (s: string) => analyzeCondition(s);

export const checkDocs = (docs: SemanticDoc[]): SemanticResult => {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  const err = (file: string, message: string) =>
    errors.push({ file, level: 'error', code: 'SEMANTIC', message });
  const warn = (file: string, message: string) =>
    warnings.push({ file, level: 'warning', code: 'LINT', message });

  const byKey = new Map<string, string>();
  for (const { file, d } of docs) {
    const keys =
      d.kind === 'course_conditions'
        ? Object.keys(d.courses ?? {}).map((c) => `course:${c}:${d.year}:${d.provenance?.source}`)
        : [`${d.kind}:${d.code ?? d.id ?? ''}:${d.year ?? JSON.stringify(d.target?.years)}`];
    for (const key of keys) {
      if (byKey.has(key)) err(file, `duplicate identity ${key} (also ${byKey.get(key)})`);
      byKey.set(key, file);
    }
  }
  const libFor = (year: number) =>
    docs
      .filter((x) => x.d.kind === 'library' && x.d.year <= year)
      .sort((a, b) => b.d.year - a.d.year)[0]?.d;
  const findDoc = (kind: string, code: unknown, year: number): SemanticDoc | undefined => {
    const c = docs.filter((x) => x.d.kind === kind && String(x.d.code) === String(code));
    return (
      c.find((x) => x.d.year === year) ??
      c.filter((x) => x.d.year < year).sort((a, b) => b.d.year - a.d.year)[0]
    );
  };
  const resolvedBase = (start: any) => {
    let bd = start;
    for (let guard = 0; bd?.extends && guard < 20; guard++)
      bd = findDoc(bd.kind, bd.code, bd.extends.year)?.d;
    return bd;
  };
  const nodesOf = (list: any): any[] => {
    const out: any[] = [];
    const f = (l: any) => {
      for (const x of l ?? []) {
        if (x && typeof x === 'object') {
          out.push(x);
          if (x.kind === 'group') f(x.children);
        }
      }
    };
    f(list);
    return out;
  };

  for (const { file, d } of docs) {
    const ids = new Map<string, any>();
    const nodes: [any, string][] = [];
    const collect = (list: any, path: string) =>
      (list ?? []).forEach((n: any, i: number) => {
        if (!n || typeof n !== 'object') return;
        if (ids.has(n.id)) err(file, `duplicate node id "${n.id}"`);
        ids.set(n.id, n);
        nodes.push([n, `${path}[${i}]`]);
        if (n.kind === 'group') collect(n.children, `${path}[${i}].children`);
      });
    const base = resolvedBase(d);
    collect(base?.requirements ?? d.requirements, 'requirements');
    const components = new Map<string, any>((d.components ?? []).map((c: any) => [c.id, c]));
    for (const c of components.values()) ids.set(c.id, { kind: 'component' });
    const year =
      d.year ?? (typeof d.target?.years === 'number' ? d.target.years : d.target?.years?.from);
    const lib = libFor(year ?? 9999);
    const localSets = d.sets ?? {};
    if (d.kind !== 'library') {
      for (const k of Object.keys(localSets))
        if (lib?.sets?.[k] !== undefined) err(file, `local set "${k}" shadows library set`);
    }

    // Node paths (§4.1): see tools/validate.mjs checkNodeRef
    const checkNodeRef = (ref: string, where: string) => {
      if (ref === 'root' || ref.startsWith('spec:')) return;
      if (!RX.nodepath.test(ref)) {
        err(file, `${where}: malformed node path "${ref}"`);
        return;
      }
      const segs = ref.split('/');
      let cur = ids.get(segs[0] as string);
      if (!cur) {
        err(file, `${where}: unknown node ref "${ref}"`);
        return;
      }
      for (let i = 1; i < segs.length; i++) {
        const s = segs[i] as string;
        if (cur.kind === 'component') {
          const c = components.get(segs[i - 1] as string);
          const bd = resolvedBase(findDoc('program', c.program, c.year ?? d.year)?.d);
          const compIds = new Map<string, any>(nodesOf(bd?.requirements).map((n) => [n.id, n]));
          cur = compIds.get(s);
          if (!cur) {
            err(
              file,
              `${where}: "${s}" is not a node of component ${segs[i - 1]} (${c.program}) in "${ref}"`
            );
            return;
          }
        } else if (cur.kind === 'spec') {
          if (RX.spec.test(s)) {
            const explicit = cur.options.every((o: string) => RX.spec.test(o));
            if (explicit && !cur.options.includes(s))
              err(file, `${where}: ${s} is not an option of spec node ${cur.id} in "${ref}"`);
          }
          return;
        } else if (RX.spec.test(s)) {
          err(file, `${where}: spec code ${s} follows non-spec node ${cur.id} in "${ref}"`);
          return;
        } else {
          err(
            file,
            `${where}: "${segs[i - 1]}" is a ${cur.kind} node in this document; refer to "${s}" by its id`
          );
          return;
        }
      }
    };
    const checkRefs = (refs: { kind: string; name: string }[], where: string, allowIn: boolean) => {
      for (const r of refs) {
        if (
          r.kind === 'set' &&
          localSets[r.name] === undefined &&
          lib?.sets?.[r.name] === undefined
        )
          err(file, `${where}: unknown set @${r.name}`);
        if (r.kind === 'program_group' && !lib?.program_groups?.[r.name])
          err(file, `${where}: unknown program group @${r.name}`);
        if (r.kind === 'spec_group' && !lib?.spec_groups?.[r.name])
          err(file, `${where}: unknown spec group @${r.name}`);
        if (r.kind === 'faculty' && !lib?.faculties?.[r.name])
          err(file, `${where}: unknown faculty ${r.name}`);
        if (r.kind === 'school' && !lib?.schools?.[r.name])
          err(file, `${where}: unknown school ${r.name}`);
        if (r.kind === 'in' || r.kind === 'node') {
          if (!allowIn)
            err(
              file,
              `${where}: ${r.kind === 'in' ? 'in:' : 'complete()'} is only allowed in post-allocation contexts`
            );
          else checkNodeRef(r.name, where);
        }
      }
    };
    // Parse errors are the loader's job (layer 2); here only refs and context are checked.
    const checkSel = (v: any, where: string, allowIn: boolean): void => {
      if (typeof v === 'string') {
        try {
          checkRefs(parseSelRaw(v).refs, where, allowIn);
        } catch {
          /* reported by loadDocuments */
        }
      } else if (Array.isArray(v)) v.forEach((x, i) => checkSel(x, `${where}[${i}]`, allowIn));
      else if (v && typeof v === 'object') {
        const [k, val] = Object.entries(v)[0] ?? [];
        if (k === 'or' || k === 'and')
          (val as any[]).forEach((x, i) => checkSel(x, `${where}.${k}[${i}]`, allowIn));
        else if (k === 'not') checkSel(val, `${where}.not`, allowIn);
        else if (k === 'set') checkRefs([{ kind: 'set', name: val as string }], where, allowIn);
        else if (k === 'in') checkRefs([{ kind: 'in', name: val as string }], where, allowIn);
      }
    };
    const checkCond = (v: any, where: string, allowIn: boolean): void => {
      if (typeof v === 'string') {
        try {
          checkRefs(parseCond(v).refs, where, allowIn);
        } catch {
          /* reported by loadDocuments */
        }
      } else if (v && typeof v === 'object') {
        const [k, val] = Object.entries(v)[0] ?? [];
        const o = val as any;
        if (k === 'and' || k === 'or')
          o.forEach((x: any, i: number) => checkCond(x, `${where}.${k}[${i}]`, allowIn));
        else if (k === 'not') checkCond(o, `${where}.not`, allowIn);
        else if (k === 'uoc' || k === 'wam') {
          if (o?.in !== undefined) checkSel(o.in, `${where}.${k}.in`, allowIn);
        } else if (k === 'grade') {
          if (o?.in !== undefined) checkSel(o.in, `${where}.grade.in`, allowIn);
        } else if (k === 'complete') checkRefs([{ kind: 'node', name: o }], where, allowIn);
        else if (k === 'cores' && o !== true) checkSel(o, `${where}.cores`, false);
        else if (k === 'spec' || k === 'program') {
          o.forEach((x: any) => {
            if (RX.ref.test(String(x)))
              checkRefs(
                [{ kind: k === 'spec' ? 'spec_group' : 'program_group', name: String(x).slice(1) }],
                where,
                allowIn
              );
          });
        }
      }
    };

    const maxUoc = (n: any): number => {
      if (n.kind === 'core') return typeof n.uoc === 'number' ? n.uoc : Infinity;
      if (n.kind === 'pool') return typeof n.uoc === 'number' ? n.uoc : (n.uoc?.max ?? Infinity);
      if (n.kind === 'group')
        return n.choose !== undefined
          ? Infinity
          : n.children.reduce((a: number, c: any) => a + maxUoc(c), 0);
      if (n.kind === 'spec') return Infinity;
      return 0;
    };
    const limitReach = (n: any): number => {
      let ast: any;
      try {
        ast = typeof n.from === 'string' ? parseSelRaw(n.from).ast : null;
      } catch {
        return Infinity;
      }
      if (!ast) return Infinity;
      const conj: any[] = ast.and ?? [ast];
      const inc = conj.filter((c) => c.in !== undefined).map((c) => c.in);
      const exc = new Set(conj.filter((c) => c.not?.in !== undefined).map((c) => c.not.in));
      if ([...inc, ...exc].some((p: string) => p.includes('/'))) return Infinity;
      const bound = (x: any): number => {
        if (exc.has(x.id)) return 0;
        if (x.kind === 'component') return Infinity;
        if (x.kind === 'group') return x.children.reduce((a: number, c: any) => a + bound(c), 0);
        if (x.kind === 'core' || x.kind === 'pool' || x.kind === 'spec') return maxUoc(x);
        return 0;
      };
      if (inc.length)
        return Math.min(...inc.map((p: string) => (ids.get(p) ? bound(ids.get(p)) : Infinity)));
      const scope = n.scope ?? 'root';
      if (scope.includes('/')) return Infinity;
      const top =
        scope === 'root'
          ? (base?.requirements ?? d.requirements ?? [])
          : [ids.get(scope)].filter(Boolean);
      return top.length ? top.reduce((a: number, x: any) => a + bound(x), 0) : Infinity;
    };

    for (const [n, p] of nodes) {
      if (n.kind === 'pool') {
        checkSel(n.from, `${p}.from`, false);
        (n.quotas ?? []).forEach((q: any, i: number) =>
          checkSel(q.from, `${p}.quotas[${i}].from`, false)
        );
      }
      if (n.kind === 'limit') {
        checkSel(n.from, `${p}.from`, true);
        if (n.scope) checkNodeRef(n.scope, `${p}.scope`);
      }
      if (n.kind === 'maturity') {
        checkSel(n.applies_to, `${p}.applies_to`, true);
        checkCond(n.require, `${p}.require`, true);
      }
      if (n.kind === 'timing') checkSel(n.courses, `${p}.courses`, true);
      if (n.kind === 'check') checkCond(n.require, `${p}.require`, true);
      if (n.kind === 'core')
        for (const it of n.courses ?? [])
          if (!ITEM.test(it) || it.includes('*')) err(file, `${p}: bad core item "${it}"`);
      if (n.kind === 'spec') {
        if (n.default && !n.options.includes(n.default))
          err(file, `${p}: default ${n.default} not in options`);
        for (const r of n.counts_toward ?? []) {
          const ref = typeof r === 'string' ? r : r.node;
          checkNodeRef(ref, `${p}.counts_toward`);
          const target = ids.get(ref.split('/')[0]);
          if (target && ref.indexOf('/') < 0 && target.kind !== 'pool')
            err(file, `${p}.counts_toward: "${ref}" must be a pool`);
          if (typeof r === 'object' && r.courses !== undefined)
            checkSel(r.courses, `${p}.counts_toward.courses`, false);
        }
        for (const r of n.distinct_from ?? []) {
          checkNodeRef(r.node, `${p}.distinct_from`);
          const target = ids.get(r.node.split('/')[0]);
          if (target && !r.node.includes('/') && target.kind !== 'spec')
            err(file, `${p}.distinct_from: "${r.node}" must be a spec node`);
        }
        for (const o of n.options)
          if (RX.ref.test(o) && !lib?.spec_groups?.[o.slice(1)])
            err(file, `${p}: unknown spec group ${o}`);
      }
      if (
        n.kind === 'group' &&
        typeof n.choose === 'object' &&
        n.choose.max !== undefined &&
        n.choose.max > n.children.length
      )
        err(file, `${p}: choose.max exceeds children`);
      if (n.kind === 'group' && n.uoc !== undefined) {
        const min = typeof n.uoc === 'number' ? n.uoc : (n.uoc.min ?? 0);
        const reach = n.children.reduce((a: number, c: any) => a + maxUoc(c), 0);
        if (reach < min)
          warn(
            file,
            `${file}: lint: group ${n.id} needs ${min} UOC but its children can count at most ${reach}`
          );
      }
      if (n.kind === 'limit' && n.basis !== 'planned' && n.uoc !== undefined) {
        const max = typeof n.uoc === 'number' ? n.uoc : n.uoc.max;
        const reach = max === undefined ? Infinity : limitReach(n);
        if (reach <= max)
          warn(
            file,
            `${file}: lint: limit ${n.id} can never fail: uoc.max ${max} is at least the most its selector can count (${reach})`
          );
      }
      for (const r of [n.uoc, n.count, n.choose])
        if (
          r &&
          typeof r === 'object' &&
          r.min !== undefined &&
          r.max !== undefined &&
          r.min > r.max
        )
          err(file, `${p}: min > max`);
    }
    for (const [k, v] of Object.entries(localSets)) checkSel(v, `sets.${k}`, false);
    (d.shares ?? []).forEach((s: any, i: number) => {
      s.between.forEach((r: string) => checkNodeRef(r, `shares[${i}]`));
      if (s.courses) checkSel(s.courses, `shares[${i}].courses`, false);
      if (s.replacement?.from !== undefined)
        checkSel(s.replacement.from, `shares[${i}].replacement.from`, false);
      if (s.mode === 'replace' && s.max_uoc !== undefined)
        err(file, `shares[${i}]: max_uoc has no meaning with mode: replace`);
      if (s.mode === 'replace' && s.replacement?.from === undefined) {
        for (const side of s.between) {
          const n = side.includes('/') ? undefined : ids.get(side);
          if (n && n.kind !== 'component') {
            if (n.kind === 'spec') {
              for (const o of n.options.filter((x: string) => RX.spec.test(x))) {
                const sd = findDoc('specialisation', o, d.year);
                if (
                  sd &&
                  !nodesOf(resolvedBase(sd.d).requirements).some((x) => x.kind === 'pool')
                ) {
                  warn(
                    file,
                    `${file}: lint: shares[${i}] (mode: replace) needs replacement.from: option ${o} of side "${side}" has no pools`
                  );
                }
              }
            } else if (!nodesOf([n]).some((x) => x.kind === 'pool' || x.kind === 'spec')) {
              warn(
                file,
                `${file}: lint: shares[${i}] (mode: replace) needs replacement.from: side "${side}" has no pools`
              );
            }
          }
        }
      }
    });
    (d.substitutions ?? []).forEach((s: any, i: number) => {
      if (!ITEM.test(s.with)) err(file, `substitutions[${i}]: bad with "${s.with}"`);
      if (s.scope) checkNodeRef(s.scope, `substitutions[${i}].scope`);
      if (s.when !== undefined) checkCond(s.when, `substitutions[${i}].when`, false);
    });
    (d.exemptions ?? []).forEach((s: any, i: number) => {
      if (s.scope) checkNodeRef(s.scope, `exemptions[${i}].scope`);
      if (s.when !== undefined) checkCond(s.when, `exemptions[${i}].when`, false);
    });
    if (d.entry !== undefined) checkCond(d.entry, 'entry', false);
    if (d.allowed_if !== undefined) checkCond(d.allowed_if, 'allowed_if', false);
    (d.classes ?? []).forEach((c: any, i: number) =>
      checkCond(c.require, `classes[${i}].require`, true)
    );

    if (d.kind === 'course_conditions') {
      for (const [code, c] of Object.entries<any>(d.courses ?? {})) {
        if (c.status === 'none' && c.requires !== undefined)
          err(file, `courses.${code}: status none means "no prerequisite" but requires is present`);
        if (c.requires !== undefined) checkCond(c.requires, `courses.${code}.requires`, false);
        for (const x of c.excludes ?? []) {
          if (typeof x === 'string' && !RX.course.test(x)) {
            if (RX.cpattern.test(x))
              err(
                file,
                `courses.${code}.excludes "${x}": patterns are not allowed in excludes; list exact codes`
              );
            else {
              try {
                const { ast, refs } = parseCond(x);
                if (typeof ast !== 'object' || ast === null || !('spec' in ast || 'program' in ast))
                  throw new Error('must be a course, spec() or program()');
                checkRefs(refs, `courses.${code}.excludes`, false);
              } catch (e) {
                err(file, `courses.${code}.excludes "${x}": ${(e as Error).message}`);
              }
            }
          }
        }
      }
    }
    if (d.kind === 'patch')
      for (const op of d.ops ?? [])
        if (op.fields?.requires) checkCond(op.fields.requires, `ops.${op.target}.requires`, false);

    if (d.extends && !findDoc(d.kind, d.code, d.extends.year))
      err(file, `extends ${d.kind} ${d.code} ${d.extends.year}: not found`);
    for (const c of d.components ?? []) {
      const b = findDoc('program', c.program, c.year ?? d.year);
      if (!b) err(file, `component ${c.id}: program ${c.program} not found`);
      else {
        if (b.d.year !== (c.year ?? d.year))
          warn(
            file,
            `${file}: component ${c.id} resolves ${c.program} via year fallback to ${b.d.year}`
          );
        const bd = resolvedBase(b.d);
        const baseNodes = nodesOf(bd.requirements);
        const baseIds = new Set(baseNodes.map((n) => n.id));
        for (const id of c.include ?? [])
          if (!baseIds.has(id)) err(file, `component ${c.id}: include "${id}" not in ${c.program}`);
        for (const op of c.patch ?? [])
          if (!baseIds.has(op.target ?? op.parent))
            err(file, `component ${c.id}: patch target "${op.target}" not in ${c.program}`);
        for (const op of c.patch ?? []) {
          if (op.op === 'list_remove') {
            const n = baseNodes.find((x) => x.id === op.target);
            for (const it of op.items)
              if (!n?.[op.field]?.includes(it))
                err(
                  file,
                  `component ${c.id}: list_remove ${it} not present in ${op.target}.${op.field}`
                );
          }
        }
      }
    }
  }
  return { errors, warnings, findDoc, resolvedBase, nodesOf };
};

// Conformance fixture references (§11 rule 13; tools/validate.mjs checkFixtures). `read` loads a
// bundle document by its repo-relative path (undefined when missing). Shape is checked separately
// (checkFixtureSchema).
export const checkFixture = (file: string, fx: any, read: (path: string) => any): Diagnostic[] => {
  const out: Diagnostic[] = [];
  const err = (message: string) => out.push({ file, level: 'error', code: 'FIXTURE', message });
  const docs: SemanticDoc[] = [];
  for (const p of fx.bundle.documents) {
    const d = read(p);
    if (d === undefined) err(`bundle document ${p} not found`);
    else docs.push({ file: p, d });
  }
  (fx.bundle.inline ?? []).forEach((d: any, i: number) => {
    if (d.provenance?.source !== 'local')
      err(`${file}#inline[${i}]: inline fixture documents must have provenance.source: local`);
    docs.push({ file: `${file}#inline[${i}]`, d });
  });
  const { errors, findDoc, resolvedBase, nodesOf } = checkDocs(docs);
  for (const e of errors) err(`bundle: ${e.file}: ${e.message}`);
  const st = fx.student;
  const prog = findDoc('program', st.program, st.year);
  if (!prog) {
    err(`student.program ${st.program} ${st.year} is not in the bundle`);
    return out;
  }
  const iids = new Set<string>();
  for (const x of st.plan) {
    if (iids.has(x.iid)) err(`duplicate iid ${x.iid}`);
    iids.add(x.iid);
    if (!fx.bundle.catalogue.courses?.[x.code] && !fx.bundle.catalogue.default)
      err(`plan course ${x.code} (${x.iid}) has no catalogue entry and no catalogue default`);
    if (x.status === 'planned' && x.mark !== undefined)
      err(`${x.iid}: planned instances carry no mark`);
    if (x.outcome === 'pass' && x.mark !== undefined && x.mark < 50)
      err(`${x.iid}: outcome pass with mark < 50`);
    if (x.outcome === 'fail' && x.mark !== undefined && x.mark >= 50)
      err(`${x.iid}: outcome fail with mark >= 50`);
  }
  const iidRefs = [
    ...Object.keys(fx.expect.courses ?? {}),
    ...(fx.expect.not_counted ?? []),
    ...Object.keys(fx.expect.allocations ?? {}),
    ...(st.ignored ?? []),
    ...Object.keys(st.pins ?? {})
  ];
  for (const r of iidRefs) if (!iids.has(r)) err(`unknown iid "${r}" in expect/pins/ignored`);
  const pd = resolvedBase(prog.d);
  const progNodes = new Map<string, any>(nodesOf(pd.requirements).map((n) => [n.id, n]));
  const comps = new Set((pd.components ?? []).map((c: any) => c.id));
  const sel = st.selections ?? {};
  const checkPath = (path: string, where: string) => {
    if (path === 'root') return;
    const segs = path.split('/');
    const head = progNodes.get(segs[0] as string);
    if (!head && !comps.has(segs[0])) {
      err(`${where}: "${path}" head is not a node of ${st.program}`);
      return;
    }
    if (segs.length === 1 || comps.has(segs[0])) return;
    if (head.kind !== 'spec') {
      err(`${where}: "${path}" continues past non-spec node ${segs[0]}`);
      return;
    }
    const code = segs[1] as string;
    if (!RX.spec.test(code)) {
      err(`${where}: "${path}" must name the selected spec code after ${segs[0]}`);
      return;
    }
    if (!(sel[segs[0] as string] ?? [head.default]).includes(code))
      err(`${where}: ${code} is not selected in ${segs[0]}`);
    const sd = findDoc('specialisation', code, st.year);
    if (!sd) {
      err(`${where}: spec ${code} is not in the bundle`);
      return;
    }
    if (segs.length > 2) {
      const sn = new Map<string, any>(
        nodesOf(resolvedBase(sd.d).requirements).map((n) => [n.id, n])
      );
      if (!sn.has(segs[2] as string)) err(`${where}: "${segs[2]}" is not a node of ${code}`);
    }
  };
  for (const [k, v] of Object.entries<any>(sel)) {
    checkPath(k, 'selections');
    const n = progNodes.get(k);
    if (n?.kind === 'spec') {
      for (const c of v) if (!n.options.includes(c)) err(`selections.${k}: ${c} is not an option`);
    } else if (n?.kind === 'group') {
      for (const c of v)
        if (!n.children.some((ch: any) => ch.id === c)) err(`selections.${k}: ${c} is not a child`);
    }
  }
  for (const k of Object.keys(fx.expect.nodes ?? {})) checkPath(k, 'expect.nodes');
  for (const [k, a] of Object.entries<any>(fx.expect.allocations ?? {})) {
    for (const p of [a.primary, ...(a.shares ?? []), ...(a.credits ?? [])])
      if (p) checkPath(p, `expect.allocations.${k}`);
  }
  return out;
};
