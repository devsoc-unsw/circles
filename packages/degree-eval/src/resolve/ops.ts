// Patch ops (SCHEMA.md §9.2), shared by `extends` diffs (§2.3), component `patch` (§8) and patch
// documents (§3.5). Ops edit a document's data in place; callers clone first and commit only when
// every op succeeds (patches are atomic).

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

// documents are plain JSON data (YAML core schema), so a JSON round trip is a deep copy
export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

interface Found {
  node: Obj;
  list: unknown[];
  index: number;
}

// a requirement node by id, anywhere in the tree (ids are unique per document)
export const findNode = (requirements: unknown, id: string): Found | undefined => {
  if (!Array.isArray(requirements)) return undefined;
  for (let index = 0; index < requirements.length; index++) {
    const node: unknown = requirements[index];
    if (isObj(node)) {
      if (node.id === id) return { node, list: requirements, index };
      if (node.kind === 'group') {
        const inner = findNode(node.children, id);
        if (inner) return inner;
      }
    }
  }
  return undefined;
};

// The object an op target names: a node id, `root` (the document), or a course code in a
// course_conditions document.
const targetObject = (data: Obj, target: string): Obj | undefined => {
  if (target === 'root') return data;
  if (data.kind === 'course_conditions') {
    const courses = isObj(data.courses) ? data.courses : undefined;
    const entry = courses?.[target];
    return isObj(entry) ? entry : undefined;
  }
  return findNode(data.requirements, target)?.node;
};

const sameItem = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Applies one op; returns an error text, or undefined on success. Edits `data` in place (callers
// pass a copy).
/* eslint-disable no-param-reassign */
export const applyOp = (data: Obj, op: Obj): string | undefined => {
  const name = String(op.op);
  const target = typeof op.target === 'string' ? op.target : undefined;
  switch (name) {
    case 'set': {
      const obj = target === undefined ? undefined : targetObject(data, target);
      if (!obj || !isObj(op.fields)) return `set: target "${String(target)}" not found`;
      if ('kind' in op.fields || 'id' in op.fields)
        return `set: ${target ?? ''}: kind and id may not change`;
      Object.assign(obj, clone(op.fields));
      return undefined;
    }
    case 'remove': {
      if (data.kind === 'course_conditions' && target && isObj(data.courses)) {
        if (!(target in data.courses)) return `remove: course entry ${target} not found`;
        delete data.courses[target];
        return undefined;
      }
      const found = target === undefined ? undefined : findNode(data.requirements, target);
      if (!found) return `remove: node "${String(target)}" not found`;
      found.list.splice(found.index, 1);
      return undefined;
    }
    case 'replace': {
      const found = target === undefined ? undefined : findNode(data.requirements, target);
      if (!found || !isObj(op.node)) return `replace: node "${String(target)}" not found`;
      found.list[found.index] = { ...clone(op.node), id: found.node.id };
      return undefined;
    }
    case 'add': {
      const parent = typeof op.parent === 'string' ? op.parent : 'root';
      let list: unknown[] | undefined;
      if (parent === 'root') {
        if (!Array.isArray(data.requirements)) data.requirements = [];
        list = data.requirements as unknown[];
      } else {
        const found = findNode(data.requirements, parent);
        if (found?.node.kind === 'group') {
          if (!Array.isArray(found.node.children)) found.node.children = [];
          list = found.node.children as unknown[];
        }
      }
      if (!list || !isObj(op.node)) return `add: parent "${parent}" not found or not a group`;
      const anchor =
        typeof op.before === 'string'
          ? op.before
          : typeof op.after === 'string'
            ? op.after
            : undefined;
      let at = list.length;
      if (anchor !== undefined) {
        const i = list.findIndex((n) => isObj(n) && n.id === anchor);
        if (i < 0) return `add: sibling "${anchor}" not found under ${parent}`;
        at = typeof op.before === 'string' ? i : i + 1;
      }
      list.splice(at, 0, clone(op.node));
      return undefined;
    }
    case 'list_add':
    case 'list_remove': {
      const obj = target === undefined ? undefined : targetObject(data, target);
      const field = typeof op.field === 'string' ? op.field : '';
      if (!obj) return `${name}: target "${String(target)}" not found`;
      const items: unknown[] = Array.isArray(op.items) ? op.items : [];
      const current = obj[field];
      if (current !== undefined && !Array.isArray(current)) {
        return `${name}: ${target ?? ''}.${field} is not a list`;
      }
      const list = (current as unknown[] | undefined) ?? [];
      if (name === 'list_add') {
        obj[field] = [...list, ...items.filter((it) => !list.some((x) => sameItem(x, it)))];
        return undefined;
      }
      const missing = items.find((it) => !list.some((x) => sameItem(x, it)));
      if (missing !== undefined) {
        return `list_remove: ${JSON.stringify(missing)} is not in ${target ?? ''}.${field}`;
      }
      obj[field] = list.filter((x) => !items.some((it) => sameItem(x, it)));
      return undefined;
    }
    default:
      return `unknown op "${name}"`;
  }
};

/* eslint-enable no-param-reassign */

// Applies ops to a copy; returns the new data, or the first failure.
export const applyOps = (
  data: Obj,
  ops: unknown
): { data: Obj; error?: undefined } | { data?: undefined; error: string } => {
  const copy = clone(data);
  for (const op of Array.isArray(ops) ? ops : []) {
    if (!isObj(op)) return { error: 'an op must be a mapping' };
    const error = applyOp(copy, op);
    if (error) return { error };
  }
  return { data: copy };
};

const normalise = (s: string) => s.replace(/\s+/g, ' ').trim();

// A patch `expect` guard: { "<target>.<field>": exact text (whitespace-normalised) }.
export const checkExpect = (data: Obj, expect: unknown): string | undefined => {
  if (!isObj(expect)) return undefined;
  for (const [key, want] of Object.entries(expect)) {
    const dot = key.indexOf('.');
    const target = dot < 0 ? key : key.slice(0, dot);
    const field = dot < 0 ? '' : key.slice(dot + 1);
    const obj = targetObject(data, target);
    const have = obj?.[field];
    if (typeof have !== 'string' || normalise(have) !== normalise(String(want))) {
      return `expect ${key} no longer matches${typeof have === 'string' ? '' : ' (field missing)'}`;
    }
  }
  return undefined;
};
