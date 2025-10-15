import { useQueries } from '@tanstack/react-query';
import { getCourseRating } from 'utils/api/unilectivesApi';

export default function useCourseManageabilities(courseCodes: string[]): string[] {
  const courseRatings = useQueries({
    queries: courseCodes.map((courseCode) => ({
      queryKey: [`${courseCode}`],
      queryFn: () => getCourseRating(courseCode)
    }))
  });

  const manageabilities = courseRatings
    .map((rating) => rating.data?.manageability)
    .filter((rating) => typeof rating === 'number')
    .map((rating) => rating.toFixed(1));

  return manageabilities;
}
