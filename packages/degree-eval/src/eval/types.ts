// Public types of evaluation (SCHEMA.md §7, EVALUATOR.md §3).
import type { Diagnostic } from '../load';

export type Tri = 'met' | 'unmet' | 'unknown';

// §7.8 (normative); schema.json#/$defs/reasonCode holds the same list
export type ReasonCode =
  | 'below_min'
  | 'above_max'
  | 'not_planned'
  | 'not_selected'
  | 'select_spec'
  | 'not_allowed'
  | 'distinct_violation'
  | 'overlap_undeclared'
  | 'replacement_missing'
  | 'provisional'
  | 'excluded'
  | 'requires_unmet'
  | 'requires_unknown'
  | 'no_condition_data'
  | 'missing_mark'
  | 'failed'
  | 'catalogue_missing'
  | 'manual'
  | 'not_attested'
  | 'inactive'
  | 'no_matching_cores'
  | 'unresolved_path'
  | 'not_counted';

export interface Reason {
  code: ReasonCode;
  text: string;
  iids?: string[];
  atom?: string; // the condition atom that decided it, in compact form
}

// Catalogue facts for one course in one year (§7.1). Level comes from the code.
export interface CourseFacts {
  code: string;
  uoc: number;
  career?: string;
  faculty?: string;
  school?: string;
  gen_ed?: boolean;
  attrs?: string[];
  equivalents?: string[];
  terms?: string[];
}

export interface CatalogueProvider {
  get(year: number): ReadonlyMap<string, CourseFacts> | undefined;
}

export type Outcome = 'pass' | 'pass_no_mark' | 'fail' | 'withdrawn' | 'pending';

export interface PlanInstance {
  iid: string;
  code: string;
  term: number; // the plan's global term ordinal
  year?: number; // catalogue/handbook year of that term; defaults to the commencement year
  status: 'completed' | 'planned';
  outcome?: Outcome; // required when completed
  mark?: number;
  grade?: string;
}

export interface StudentState {
  program: string;
  year: number; // commencement year
  horizon?: 'planned' | 'completed';
  selections?: Record<string, string[]>; // node path → spec codes or child ids
  plan: PlanInstance[];
  attest?: Record<string, boolean>;
  pins?: Record<string, string>; // iid → node path
  ignored?: string[];
  reported?: Record<string, number>;
}

export interface UocRange {
  min?: number;
  max?: number;
}

export type AllocationKind = 'primary' | 'replacement' | 'share' | 'credit';

export interface NodeResult {
  path: string;
  id: string;
  kind: string; // node kind, or 'root', 'subtree' (a selected spec), 'component'
  title?: string;
  status: Tri;
  projected: boolean;
  counted_uoc: number;
  credited_uoc: number;
  required_uoc?: UocRange;
  allocations: { iid: string; kind: AllocationKind }[];
  reasons: Reason[];
  warnings: Reason[];
  inactive?: boolean; // §4.2 limit with an inactive scope; info {confirm: false}
  autoSelected?: string[]; // §7.5 auto-choice
  selected?: string[]; // spec slot: the selected spec codes; choice group: chosen child ids
  children: string[];
}

export interface InstanceAllocation {
  primary: string | null; // primary or replacement node
  replacement?: boolean;
  shares: string[];
  credits: string[];
  failedOn?: string[];
}

export interface ConditionResult {
  status: Tri;
  projected: boolean;
  reasons: Reason[];
  warnings: Reason[];
}

export interface Evaluation {
  program: { code: string; year: number; yearFallback: boolean; title?: string };
  root: NodeResult;
  nodes: ReadonlyMap<string, NodeResult>;
  instances: ReadonlyMap<string, InstanceAllocation>;
  notCounted: string[];
  entry?: ConditionResult; // advisory (§3.1)
  awardClass?: string | null; // first class whose `require` is met (§3.1); null when none
  diagnostics: Diagnostic[];
}
