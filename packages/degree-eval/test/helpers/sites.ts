// The validate.mjs site walk lives in src/validate/stats.ts (shared with the CLI); this adds the
// test-data loader.
import type { FileDoc } from '../../src/validate/stats';
import { listYaml, loadYaml } from './test-data';

export type { Compact, FileDoc as Doc, FileSite as Site } from '../../src/validate/stats';
export {
  collectSites,
  compactStrings,
  conditionStrings,
  parseStats,
  selectorStrings
} from '../../src/validate/stats';

export const loadDocs = (dir: string): FileDoc[] =>
  listYaml(dir).map((file) => ({ file, d: loadYaml(file) as FileDoc['d'] }));
