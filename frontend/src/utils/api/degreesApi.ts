import type { SourceFile } from '@circles/degree-eval';
import axios from 'axios';

export type DegreeDocuments = {
  version: string;
  documents: SourceFile[];
};

// Every degree document as YAML text; the browser evaluates them (utils/degreeEval).
export const getDegreeDocuments = async (): Promise<DegreeDocuments> => {
  const res = await axios.get<DegreeDocuments>('/degrees/documents');
  return res.data;
};
