// Spec slot selections from a flat list of spec codes, for clients that store a student's
// specialisations without saying which slot each fills (the Circles planner keeps `specs: [...]`).
import type { IRNode } from '../ir/tree';
import { buildTree } from '../ir/tree';
import type { Bundle } from '../resolve/bundle';
import { patternMatches } from './context';

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
  // an option is a spec code, a pattern (COMP*1) or a library spec group (@science_majors, whose
  // members may themselves be patterns), §4.2
  const offers = (n: IRNode, code: string) =>
    (n.raw.options as unknown[]).map(String).some((option) => {
      if (!option.startsWith('@')) return patternMatches(option, code);
      const groups = bundle.library(n.doc.year)?.spec_groups;
      const members =
        typeof groups === 'object' && groups !== null
          ? (groups as Record<string, unknown>)[option.slice(1)]
          : undefined;
      return Array.isArray(members) && members.map(String).some((m) => patternMatches(m, code));
    });
  const selections: Record<string, string[]> = {};
  const unplaced: string[] = [];
  for (const code of codes) {
    const slot = slots.find((n) => {
      const taken = selections[n.path]?.length ?? 0;
      return offers(n, code) && taken < (n.count?.max ?? Infinity);
    });
    if (slot) selections[slot.path] = [...(selections[slot.path] ?? []), code];
    else unplaced.push(code);
  }
  return { selections, unplaced };
};
