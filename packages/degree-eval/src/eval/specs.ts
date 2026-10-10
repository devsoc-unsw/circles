// Spec slot selections from a flat list of spec codes, for clients that store a student's
// specialisations without saying which slot each fills (the Circles planner keeps `specs: [...]`).
import { buildTree } from '../ir/tree';
import type { Bundle } from '../resolve/bundle';

export interface SpecAssignment {
  selections: Record<string, string[]>; // spec slot path → codes, ready for StudentState
  unplaced: string[]; // codes no slot of the program offers (or every offering slot is full)
}

// Each code goes to the first spec slot, in document order, that lists it in `options` and still
// has room under its `count` maximum (default 1). Program and component slots are considered; slots
// inside a defaulted spec are not. Slots inside an unchosen `choose` branch count:
// selecting a spec there is what implicitly chooses the branch.
export const assignSpecs = (
  bundle: Bundle,
  program: string,
  year: number,
  codes: readonly string[]
): SpecAssignment => {
  const tree = buildTree(bundle, { program, year, selections: {} });
  if ('error' in tree) return { selections: {}, unplaced: [...codes] };
  const slots = [...tree.nodes.values()].filter(
    (n) => n.kind === 'spec' && Array.isArray(n.raw.options) && n.doc.kind !== 'specialisation'
  );
  const selections: Record<string, string[]> = {};
  const unplaced: string[] = [];
  for (const code of codes) {
    const slot = slots.find((n) => {
      const taken = selections[n.path]?.length ?? 0;
      return (n.raw.options as unknown[]).includes(code) && taken < (n.count?.max ?? Infinity);
    });
    if (slot) selections[slot.path] = [...(selections[slot.path] ?? []), code];
    else unplaced.push(code);
  }
  return { selections, unplaced };
};
