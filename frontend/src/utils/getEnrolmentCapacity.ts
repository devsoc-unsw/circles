import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';

const getEnrolmentCapacity = (data?: CourseTimetable): EnrolmentCapacityData | undefined => {
  if (!data) {
    return undefined;
  }
  const enrolmentCapacityData: EnrolmentCapacityData = {
    enrolments: 0,
    capacity: 0
  };
  for (let i = 0; i < data.classes.length; i++) {
    if (
      data.classes[i].activity === 'Lecture' ||
      data.classes[i].activity === 'Seminar' ||
      data.classes[i].activity === 'Thesis Research' ||
      data.classes[i].activity === 'Project'
    ) {
      enrolmentCapacityData.enrolments += data.classes[i].courseEnrolment.enrolments;
      enrolmentCapacityData.capacity += data.classes[i].courseEnrolment.capacity;
    }
  }
  return enrolmentCapacityData;
};

export default getEnrolmentCapacity;
