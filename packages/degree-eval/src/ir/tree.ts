// The resolved requirement tree for one student (SCHEMA.md §7.2 steps 1–3, §4.1 node paths, §8).
import type { UocRange } from '../eval/types';
import type { CoreItem, Selector } from '../lang/ast';
import { parseCoreItem } from '../lang/core-item';
import { normalizeSelector } from '../lang/normalize';
import { RX } from '../lang/patterns';
import type { Diagnostic } from '../load';
import type { Bundle, ResolvedDoc } from '../resolve/bundle';
import { applyOps, findNode } from '../resolve/ops';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export type IRKind =
  | 'root'
  | 'component'
  | 'subtree' // the attached requirements of one selected spec: `slot/CODE`
  | 'group'
  | 'core'
  | 'pool'
  | 'spec'
  | 'limit'
  | 'maturity'
  | 'timing'
  | 'check'
  | 'info';

// The document a node came from: its sets, year and path prefix.
export interface DocCtx {
  key: string; // pools are re-seated by `priority` within one DocCtx (§7.4)
  kind: 'program' | 'specialisation';
  code: string;
  year: number;
  data: Obj;
  base: string; // path prefix of this document's node ids
  root: IRNode; // what `root` means inside this document
}

export interface Alternative {
  codes: string[]; // one code, or an and-list
  and: boolean;
  pattern: boolean; // a substitution `with` may use course patterns
  substituted: boolean;
  provisional: boolean; // added by a substitution whose `when` is unknown (§5.3)
}

export interface CoreItemIR {
  key: string; // `${node.path}#${index}`
  node: IRNode;
  index: number;
  alternatives: Alternative[];
  written: string;
  exempt?: { provisional: boolean };
}

export interface QuotaIR {
  selector: Selector;
  uoc: UocRange;
  count: UocRange;
}

export interface PoolIR {
  selector: Selector;
  uoc: UocRange;
  count: UocRange;
  quotas: QuotaIR[];
  role: 'elective' | 'gen_ed' | 'free_elective';
  overflow: boolean;
  priority: number;
}

export interface IRNode {
  path: string;
  id: string;
  kind: IRKind;
  raw: Obj;
  doc: DocCtx;
  parent?: IRNode;
  children: IRNode[];
  pre: number; // pre-order index among active nodes (-1 when inactive)
  inactive: boolean; // in an unchosen `choose` branch
  severity: 'error' | 'warning';
  uoc?: UocRange; // declared uoc (group, core, pool, spec, subtree, component, root)
  // spec slots
  selected?: string[];
  count?: UocRange;
  // choice groups
  choose?: UocRange;
  chosen?: string[];
  autoSelected?: boolean;
  // allocating nodes
  items?: CoreItemIR[];
  pool?: PoolIR;
}

export interface Rule {
  raw: Obj;
  doc: DocCtx;
}

export interface Tree {
  program: ResolvedDoc;
  root: IRNode;
  nodes: Map<string, IRNode>; // every node, active or not, by canonical path
  active: IRNode[]; // active nodes in pre-order
  shares: Rule[]; // program rules first, then hoisted spec rules in pre-order (§7.4 step 1b)
  substitutions: Rule[];
  exemptions: Rule[];
  choiceGroups: IRNode[]; // `choose` groups in pre-order
  unselectedChoices: IRNode[]; // choice groups with no explicit or implicit selection (§7.5)
  diagnostics: Diagnostic[];
}

export const toRange = (v: unknown): UocRange => {
  if (typeof v === 'number') return { min: v, max: v };
  if (isObj(v)) {
    return {
      ...(typeof v.min === 'number' ? { min: v.min } : {}),
      ...(typeof v.max === 'number' ? { max: v.max } : {})
    };
  }
  return {};
};

// A program's or specialisation's own `uoc` is its total: an integer is a minimum, not an exact
// amount (SCHEMA.md §4.2 "counted UOC ≥ the spec's uoc", §7.6 "a UOC minimum m"), so courses beyond
// it do not fail the degree. A {min, max} range keeps its maximum (3959's {min: 66, max: 72}).
const toTotal = (v: unknown): UocRange => (typeof v === 'number' ? { min: v } : toRange(v));

const NODE_KINDS = new Set([
  'group',
  'core',
  'pool',
  'spec',
  'limit',
  'maturity',
  'timing',
  'check',
  'info'
]);

const selectorOf = (v: unknown): Selector => {
  try {
    return normalizeSelector(v).ast;
  } catch {
    return { not: { any: true } }; // the loader already reported it; match nothing
  }
};

const coreItems = (node: IRNode): CoreItemIR[] =>
  (Array.isArray(node.raw.courses) ? node.raw.courses : []).map((written: unknown, index) => {
    let item: CoreItem;
    try {
      item = parseCoreItem(String(written));
    } catch {
      item = String(written);
    }
    const alt = (codes: string[], and: boolean): Alternative => ({
      codes,
      and,
      pattern: false,
      substituted: false,
      provisional: false
    });
    let alternatives: Alternative[];
    if (typeof item === 'string') alternatives = [alt([item], false)];
    else if ('or' in item) alternatives = item.or.map((c) => alt([c], false));
    else alternatives = [alt(item.and, true)];
    return { key: `${node.path}#${index}`, node, index, alternatives, written: String(written) };
  });

const poolOf = (raw: Obj): PoolIR => ({
  selector: selectorOf(raw.from),
  uoc: toRange(raw.uoc),
  count: toRange(raw.count),
  quotas: (Array.isArray(raw.quotas) ? raw.quotas : []).filter(isObj).map((q) => ({
    selector: selectorOf(q.from),
    uoc: toRange(q.uoc),
    count: toRange(q.count)
  })),
  role: raw.role === 'gen_ed' || raw.role === 'free_elective' ? raw.role : 'elective',
  overflow: raw.overflow === true,
  priority: typeof raw.priority === 'number' ? raw.priority : 0
});

export interface BuildInput {
  program: string;
  year: number;
  selections: Record<string, string[]>;
  choices?: ReadonlyMap<string, string[]>; // auto-choice decisions (§7.5), by group path
}

export const buildTree = (bundle: Bundle, input: BuildInput): Tree | { error: string } => {
  const program = bundle.program(input.program, input.year);
  if (!program) return { error: `program ${input.program} (${input.year}) is not in the bundle` };
  const diagnostics: Diagnostic[] = [];
  const nodes = new Map<string, IRNode>();
  const shares: Rule[] = [];
  const substitutions: Rule[] = [];
  const exemptions: Rule[] = [];
  const rulesOf = (doc: DocCtx) => {
    const take = (list: unknown, into: Rule[]) => {
      for (const raw of Array.isArray(list) ? list : []) if (isObj(raw)) into.push({ raw, doc });
    };
    take(doc.data.shares, shares);
    take(doc.data.substitutions, substitutions);
    take(doc.data.exemptions, exemptions);
  };

  const make = (
    path: string,
    id: string,
    kind: IRKind,
    raw: Obj,
    doc: DocCtx,
    parent?: IRNode
  ): IRNode => {
    const node: IRNode = {
      path,
      id,
      kind,
      raw,
      doc,
      ...(parent ? { parent } : {}),
      children: [],
      pre: -1,
      inactive: false,
      severity: raw.severity === 'warning' ? 'warning' : 'error'
    };
    if (raw.uoc !== undefined) node.uoc = toRange(raw.uoc);
    nodes.set(path, node);
    return node;
  };

  const ctxFor = (resolved: ResolvedDoc, base: string, key: string, root?: IRNode): DocCtx => ({
    key,
    kind: resolved.kind,
    code: resolved.code,
    year: resolved.year,
    data: resolved.data,
    base,
    root: root as IRNode
  });

  const buildList = (list: unknown, parent: IRNode, doc: DocCtx) => {
    for (const raw of Array.isArray(list) ? list : []) {
      if (isObj(raw) && typeof raw.id === 'string' && NODE_KINDS.has(String(raw.kind))) {
        const node = make(`${doc.base}${raw.id}`, raw.id, raw.kind as IRKind, raw, doc, parent);
        parent.children.push(node);
        if (node.kind === 'group') {
          if (raw.choose !== undefined) node.choose = toRange(raw.choose);
          buildList(raw.children, node, doc);
        } else if (node.kind === 'core') {
          node.items = coreItems(node);
        } else if (node.kind === 'pool') {
          node.pool = poolOf(raw);
        } else if (node.kind === 'spec') {
          node.count = raw.count === undefined ? { min: 1, max: 1 } : toRange(raw.count);
          const chosen = input.selections[node.path];
          const fallback = typeof raw.default === 'string' ? [raw.default] : [];
          // several specs in one slot attach in code order, not selection order (§4.2)
          node.selected = [...new Set(chosen ?? fallback)].sort();
          for (const code of node.selected) {
            const spec = bundle.specialisation(code, doc.year);
            if (!spec) {
              diagnostics.push({
                level: 'error',
                code: 'SPEC_NOT_FOUND',
                path: node.path,
                message: `${node.path}: specialisation ${code} (${doc.year}) is not in the bundle`
              });
            } else {
              const sub = make(`${node.path}/${code}`, code, 'subtree', spec.data, doc, node);
              if (spec.data.uoc !== undefined) sub.uoc = toTotal(spec.data.uoc);
              const ctx = ctxFor(spec, `${node.path}/${code}/`, `spec:${node.path}/${code}`, sub);
              sub.doc = ctx;
              node.children.push(sub);
              buildList(spec.data.requirements, sub, ctx);
              rulesOf(ctx);
            }
          }
        }
      }
    }
  };

  const rootDoc = ctxFor(program, '', `program:${program.code}`);
  const root = make('root', 'root', 'root', program.data, rootDoc);
  rootDoc.root = root;
  if (program.data.uoc !== undefined) root.uoc = toTotal(program.data.uoc);
  rulesOf(rootDoc);

  // §8: each component becomes a group of the included (patched) nodes of its program
  for (const c of (Array.isArray(program.data.components) ? program.data.components : []).filter(
    isObj
  )) {
    const id = String(c.id);
    const year = typeof c.year === 'number' ? c.year : program.year;
    const prog = bundle.program(String(c.program), year);
    if (!prog) {
      diagnostics.push({
        level: 'error',
        code: 'COMPONENT_NOT_FOUND',
        path: id,
        message: `component ${id}: program ${String(c.program)} (${year}) is not in the bundle`
      });
    } else {
      const patched = applyOps(prog.data, c.patch);
      if (patched.error !== undefined) {
        diagnostics.push({
          level: 'error',
          code: 'COMPONENT_PATCH_FAILED',
          path: id,
          message: `component ${id}: ${patched.error}`
        });
      }
      const data = patched.data ?? prog.data;
      const include = Array.isArray(c.include) ? c.include.map(String) : undefined;
      const requirements = include
        ? include.flatMap((x) => {
            const found = findNode(data.requirements, x);
            return found ? [found.node] : [];
          })
        : data.requirements;
      const comp = make(id, id, 'component', { ...c, title: c.title ?? data.title }, rootDoc, root);
      if (c.uoc !== undefined) comp.uoc = toRange(c.uoc);
      root.children.push(comp);
      const ctx = ctxFor({ ...prog, data }, `${id}/`, `component:${id}`, comp);
      comp.doc = ctx;
      buildList(requirements, comp, ctx);
      // §8 does not define importing a component's shares/substitutions/exemptions; v1 does not
      if (
        ['shares', 'substitutions', 'exemptions'].some(
          (k) => Array.isArray(data[k]) && (data[k] as unknown[]).length
        )
      ) {
        diagnostics.push({
          level: 'info',
          code: 'COMPONENT_RULES_NOT_IMPORTED',
          path: id,
          message: `component ${id}: shares, substitutions and exemptions of ${String(c.program)} are not imported (declare them on ${program.code})`
        });
      }
    }
  }
  buildList(program.data.requirements, root, rootDoc);

  // §4.2 group `choose`: explicit selection, implicit (a selection inside a branch), or auto-choice
  const choiceGroups: IRNode[] = [];
  const unselectedChoices: IRNode[] = [];
  const selectionNodes = Object.keys(input.selections)
    .map((p) => nodes.get(p))
    .filter((n): n is IRNode => n !== undefined);
  const visit = (n: IRNode, inactive: boolean) => {
    // eslint-disable-next-line no-param-reassign -- building the tree
    n.inactive = inactive;
    if (n.kind === 'group' && n.choose && !inactive) {
      choiceGroups.push(n);
      const explicit = input.selections[n.path] ?? input.choices?.get(n.path);
      const implicit = n.children
        .filter((child) =>
          selectionNodes.some((s) => s.path.startsWith(`${child.path}/`) || s === child)
        )
        .map((child) => child.id);
      const chosen = explicit ?? (implicit.length ? implicit : undefined);
      // eslint-disable-next-line no-param-reassign
      if (chosen) n.chosen = chosen;
      // eslint-disable-next-line no-param-reassign
      n.autoSelected = !input.selections[n.path] && input.choices?.has(n.path) === true;
      if (!n.chosen) unselectedChoices.push(n);
    }
    for (const child of n.children) {
      visit(
        child,
        inactive ||
          (n.chosen !== undefined && n.choose !== undefined && !n.chosen.includes(child.id))
      );
    }
  };
  visit(root, false);

  const active: IRNode[] = [];
  const order = (n: IRNode) => {
    if (n.inactive) return;
    // eslint-disable-next-line no-param-reassign
    n.pre = active.length;
    active.push(n);
    n.children.forEach(order);
  };
  order(root);

  return {
    program,
    root,
    nodes,
    active,
    shares,
    substitutions,
    exemptions,
    choiceGroups,
    unselectedChoices,
    diagnostics
  };
};

// §4.1 node paths, relative to the document `doc` that contains the reference. Returns the nodes the
// path denotes (a `slot/id` path may match in several selected specs), or `unresolved`.
export const resolvePath = (
  tree: Tree,
  ref: string,
  doc: DocCtx
): { nodes: IRNode[]; unresolved: boolean } => {
  const none = { nodes: [] as IRNode[], unresolved: true };
  if (ref === 'root') return { nodes: [doc.root], unresolved: false };
  const segs = ref.split('/');
  let current: IRNode[];
  if (ref.startsWith('spec:')) {
    const code = (segs.shift() as string).slice('spec:'.length);
    current = [...tree.nodes.values()].filter(
      (n) => n.kind === 'subtree' && n.id === code && !n.inactive
    );
    if (!current.length) return { nodes: [], unresolved: false }; // no slot holds it: empty
  } else {
    const head = tree.nodes.get(`${doc.base}${segs.shift() as string}`);
    if (!head) return none;
    current = [head];
  }
  for (const seg of segs) {
    const next: IRNode[] = [];
    for (const cur of current) {
      if (cur.kind === 'spec') {
        if (RX.spec.test(seg)) {
          const sub = tree.nodes.get(`${cur.path}/${seg}`);
          if (sub) next.push(sub); // not selected: the path is empty, not unresolved
        } else {
          for (const sub of cur.children) {
            const n = tree.nodes.get(`${sub.path}/${seg}`);
            if (n) next.push(n);
          }
          if (!next.length && cur.children.length) return none;
        }
      } else if (cur.kind === 'subtree' || cur.kind === 'component') {
        const n = tree.nodes.get(`${cur.path}/${seg}`);
        if (!n) return none;
        next.push(n);
      } else return none;
    }
    current = next;
  }
  return { nodes: current, unresolved: false };
};

// Is `n` inside the subtree of `ancestor` (or `ancestor` itself)?
export const within = (n: IRNode, ancestor: IRNode): boolean => {
  for (let cur: IRNode | undefined = n; cur; cur = cur.parent) if (cur === ancestor) return true;
  return false;
};
