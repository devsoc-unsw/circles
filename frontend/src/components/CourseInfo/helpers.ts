import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';

export const getEnrolmentCapacity = (data?: CourseTimetable): EnrolmentCapacityData | undefined => {
  if (!data) {
    return undefined;
  }
  const enrolmentCapacityData: EnrolmentCapacityData = {
    enrolments: 0,
    capacity: 0,
  };
  for (let i = 0; i < data.classes.length; i++) {
    if (
      data.classes[i].activity === 'Lecture'
      || data.classes[i].activity === 'Seminar'
      || data.classes[i].activity === 'Thesis Research'
      || data.classes[i].activity === 'Project'
    ) {
      enrolmentCapacityData.enrolments
        += data.classes[i].courseEnrolment.enrolments;
      enrolmentCapacityData.capacity
        += data.classes[i].courseEnrolment.capacity;
    }
  }
  return enrolmentCapacityData;
};

export function unwrap<T>(res: PromiseSettledResult<T>): T | undefined {
  if (res.status === 'rejected') {
    // eslint-disable-next-line no-console
    console.log('Rejected request at getInfo', res.reason);
    return undefined;
  }
  return res.value;
}
