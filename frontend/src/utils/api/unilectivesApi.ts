import axios from 'axios';
import { UnilectivesCourse } from 'types/unilectives';

// eslint-disable-next-line import/prefer-default-export
export const getCourseRating = async (code: string) => {
  try {
    const res = await axios.get<{ course: UnilectivesCourse }>(
      `https://unilectives.devsoc.app/api/v1/course/${code}`
    );
    return res.data.course;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at getCourseRating: ', err);
    return undefined;
  }
};
