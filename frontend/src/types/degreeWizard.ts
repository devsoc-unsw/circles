export type CoreCoursesPreference = 'none' | 'lower' | 'higher';

export type DegreeWizardPayload = {
  programCode: string;
  startYear?: number;
  endYear?: number;
  specs: string[];
  addCoreCourses: CoreCoursesPreference;
};
