import { useQuery } from '@tanstack/react-query';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import getEvaluator from './client';
import { evaluateProgression } from './evaluateProgression';
import loadExampleDocuments from './exampleDocuments';

let documents: ReturnType<typeof loadExampleDocuments> | undefined;

// The progression evaluated in the browser from the degree documents (behind DEGREE_EVAL_ENABLED).
// The query key is the student's state, so any planner change re-evaluates.
const useDegreeEvaluation = (
  enabled: boolean,
  degree: DegreeResponse | undefined,
  planner: PlannerResponse | undefined,
  courses: CoursesResponse | undefined
) =>
  useQuery({
    queryKey: ['degreeEval', degree, planner, courses],
    queryFn: async () => {
      documents ??= loadExampleDocuments();
      return evaluateProgression(
        getEvaluator(),
        await documents,
        degree as DegreeResponse,
        planner as PlannerResponse,
        courses as CoursesResponse
      );
    },
    enabled: enabled && !!degree && !!planner && !!courses,
    staleTime: Infinity
  });

export default useDegreeEvaluation;
