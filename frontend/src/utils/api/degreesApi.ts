import type { SourceFile } from '@circles/degree-eval';
import axios from 'axios';

export type DegreeDocuments = {
  version: string;
  documents: SourceFile[];
};

export type DegreeDocumentsFilter = {
  programCode: string;
  specs: string[];
  startYear: number;
};

// The degree documents as YAML text; the browser evaluates them (utils/degreeEval). With a filter,
// only what evaluating that program needs (its years, components, specs, libraries and patches).
export const getDegreeDocuments = async (
  filter?: DegreeDocumentsFilter
): Promise<DegreeDocuments> => {
  const res = await axios.get<DegreeDocuments>('/degrees/documents', {
    params: filter && {
      programCode: filter.programCode,
      specs: filter.specs.length ? filter.specs.join(',') : undefined,
      start_year: filter.startYear
    }
  });
  return res.data;
};
