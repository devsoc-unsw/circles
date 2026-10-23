import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { getCourseInfo } from 'utils/api/coursesApi';
import { getDegreeDocuments } from 'utils/api/degreesApi';
import { CourseDetails } from './catalogue';
import getEvaluator from './client';
import { evaluateProgression } from './evaluateProgression';

// The progression evaluated in the browser from the degree documents (behind DEGREE_EVAL_ENABLED).
// The query key is the student's state, so any planner change re-evaluates. The documents come
// from the backend once per page load (GET /degrees/documents, revalidated by its ETag). Each course's details
// (gen-ed, faculty, school, equivalents) come from /courses/getCourse, shared with the rest of the
// app's ['courses', code, 'info'] cache; a course whose details fail to load keeps only its UOC.
const useDegreeEvaluation = (
  enabled: boolean,
  degree: DegreeResponse | undefined,
  planner: PlannerResponse | undefined,
  courses: CoursesResponse | undefined
) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['degreeEval', degree, planner, courses],
    queryFn: async () => {
      const documents = queryClient.fetchQuery({
        queryKey: ['degreeDocuments'],
        queryFn: getDegreeDocuments,
        staleTime: Infinity
      });
      const codes = Object.keys(courses ?? {});
      const details = await Promise.all(
        codes.map((code) =>
          queryClient
            .fetchQuery({
              queryKey: ['courses', code, 'info'],
              queryFn: () => getCourseInfo(code),
              staleTime: Infinity
            })
            .then(
              (d): CourseDetails | undefined => d,
              () => undefined
            )
        )
      );
      return evaluateProgression(
        getEvaluator(),
        (await documents).documents,
        degree as DegreeResponse,
        planner as PlannerResponse,
        courses as CoursesResponse,
        Object.fromEntries(codes.map((code, i) => [code, details[i]]))
      );
    },
    enabled: enabled && !!degree && !!planner && !!courses,
    staleTime: Infinity
  });
};

export default useDegreeEvaluation;
