export type DegreeWizardPayload = {
  programCode: string;
  isComplete: boolean;
  startYear?: number;
  endYear?: number;
  specs: string[];
};
