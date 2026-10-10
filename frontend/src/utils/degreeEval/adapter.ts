// Evaluation → the types pages/ProgressionChecker already renders (EVALUATOR.md M9).
//
// Groups: each selected specialisation is a group (its code), every other requirement is grouped
// under its top-level node (its title), and rule-like nodes (limit, maturity, timing, check,
// confirmable info) go to "Rules". Each core or pool node is a subgroup listing the courses the
// evaluator allocated to it; a core also lists its unmet items. Notes carry the evaluator's status
// and reasons, so the student sees why a requirement is not met.
import type { Evaluation, NodeResult } from '@circles/degree-eval';
import { ProgressionViewStructure, ViewSubgroupCourse } from 'types/progressionViews';
import { ProgramStructure } from 'types/structure';
import { CoursesResponse } from 'types/userResponse';
import { MAX_COURSES_OVERFLOW } from 'config/constants';

export type EvaluatedProgression = {
  structure: ProgramStructure;
  view: ProgressionViewStructure;
  notCounted: ViewSubgroupCourse[];
  totalUOC: number;
  freeElectivesUOC: number;
  status: NodeResult['status'];
  summary: string; // the root's status and reasons, for a banner
};

const RULE_KINDS = new Set(['limit', 'maturity', 'timing', 'check', 'info']);
const LEAF_KINDS = new Set(['core', 'pool', ...RULE_KINDS]);
const RULES = 'Rules';
const GENERAL = 'General';

const typeOf = (n: NodeResult): string => {
  if (RULE_KINDS.has(n.kind)) return 'info_rule';
  if (n.kind === 'core') return 'core_courses';
  if (n.role === 'gen_ed') return 'gened';
  return 'electives';
};

const uocRequired = (n: NodeResult) => n.required_uoc?.min ?? n.required_uoc?.max ?? 0;

export const describeStatus = (n: NodeResult): string => {
  const status = `${n.status === 'met' ? 'Met' : n.status === 'unmet' ? 'Not met' : 'Unknown'}${
    n.projected ? ' (if the plan goes ahead)' : ''
  }`;
  const reasons = n.reasons.map((r) => r.text);
  return [status, ...reasons].join('. ');
};

const plural = (n: number, noun: string, rest: string) =>
  `${n} ${noun}${n === 1 ? '' : 's'} ${rest}`;

// One line for the banner: the verdict, the program total and how many requirements are open.
const summarise = (ev: Evaluation): string => {
  const leaves = [...ev.nodes.values()].filter((n) => LEAF_KINDS.has(n.kind) && !n.inactive);
  const count = (status: NodeResult['status']) => leaves.filter((n) => n.status === status).length;
  const verdict = describeStatus({ ...ev.root, reasons: [] });
  const needed = ev.root.required_uoc?.min;
  const total = `${ev.root.counted_uoc}${needed === undefined ? '' : ` of ${needed}`} UOC counted`;
  const open = [
    count('unmet') ? plural(count('unmet'), 'requirement', 'not met') : '',
    count('unknown') ? plural(count('unknown'), 'requirement', 'to check') : ''
  ].filter(Boolean);
  return [verdict, total, ...open].join('. ');
};

export const toProgressionView = (
  ev: Evaluation,
  courses: CoursesResponse,
  unplanned: string[]
): EvaluatedProgression => {
  const structure: ProgramStructure = {};
  const view: ProgressionViewStructure = {};
  const codeOf = (iid: string) => iid.replace(/#\d+$/, '');
  const course = (code: string, doubleCounted = false): ViewSubgroupCourse => ({
    courseCode: code,
    title: courses[code]?.title ?? '',
    UOC: courses[code]?.uoc ?? 0,
    plannedFor: courses[code]?.plannedFor ?? '',
    isUnplanned: unplanned.includes(code),
    isMultiterm: !!courses[code]?.isMultiterm,
    isDoubleCounted: doubleCounted,
    isOverCounted: false
  });

  const add = (group: string, groupName: string, n: NodeResult) => {
    if (!structure[group]) {
      structure[group] = { name: groupName, content: {} };
      view[group] = {};
    }
    const base = n.title ?? n.text ?? n.id;
    const key = structure[group].content[base] ? `${base} (${n.id})` : base;

    const listed: ViewSubgroupCourse[] = [];
    const seen = new Set<string>();
    n.allocations.forEach((a) => {
      const code = codeOf(a.iid);
      if (!seen.has(code)) {
        seen.add(code);
        listed.push(course(code, a.kind === 'share' || a.kind === 'credit'));
      }
    });
    // core items with no course allocated: show the first alternative, to plan
    (n.items ?? []).forEach((item) => {
      const codes = item.split(/ (?:or|and) /);
      if (!codes.some((c) => seen.has(c)) && codes[0]) {
        seen.add(codes[0]);
        listed.push(course(codes[0]));
      }
    });
    listed.sort((a, b) => a.courseCode.localeCompare(b.courseCode));

    const type = typeOf(n);
    structure[group].content[key] = {
      UOC: uocRequired(n),
      type,
      courses: Object.fromEntries(listed.map((c) => [c.courseCode, c.title])),
      notes: describeStatus(n)
    };
    view[group][key] = {
      isCoursesOverflow:
        type === 'gened' || type === 'info_rule' || listed.length > MAX_COURSES_OVERFLOW,
      courses: listed
    };
  };

  const visit = (path: string, group: { key: string; name: string } | undefined) => {
    const n = ev.nodes.get(path);
    if (!n || n.inactive) return;
    if (LEAF_KINDS.has(n.kind)) {
      if (RULE_KINDS.has(n.kind)) add(RULES, '', n);
      else add(group?.key ?? GENERAL, group?.name ?? '', n);
      return;
    }
    // a selected spec (its subtree) is its own group; otherwise keep the enclosing group
    const own =
      n.kind === 'subtree'
        ? { key: n.id, name: n.title ?? '' }
        : (group ?? (path === ev.root.path ? undefined : { key: n.title ?? n.id, name: '' }));
    n.children.forEach((c) => visit(c, own));
  };
  visit(ev.root.path, undefined);

  const notCounted = [...new Set(ev.notCounted.map(codeOf))].map((c) => course(c));
  const freeElectivesUOC = [...ev.nodes.values()]
    .filter((n) => n.role === 'free_elective' && !n.inactive)
    .reduce((sum, n) => sum + n.counted_uoc, 0);

  return {
    structure,
    view,
    notCounted,
    totalUOC: ev.root.required_uoc?.min ?? ev.root.counted_uoc,
    freeElectivesUOC,
    status: ev.root.status,
    summary: summarise(ev)
  };
};
