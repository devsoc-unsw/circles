import React from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Rate } from 'antd';
import { CoursesResponse } from 'types/userResponse';
import {
  useCourseInfoQuery,
  useCoursePrereqsQuery,
  useCourseTimetableQuery,
  useCourseRatingQuery
} from 'utils/apiHooks/static';
import { useUserCoursesUnlockedWhenTaken } from 'utils/apiHooks/user';
import getEnrolmentCapacity from 'utils/getEnrolmentCapacity';
import {
  LoadingCourseDescriptionPanel,
  LoadingCourseDescriptionPanelSidebar
} from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import CourseAttributes from './CourseAttributes';
import CourseInfoDrawers from './CourseInfoDrawers';
import S from './styles';

const { Title, Text } = Typography;

type CourseDescriptionPanelProps = {
  className?: string;
  courseCode: string;
  onCourseClick?: (code: string) => void;
  courses?: CoursesResponse;
};

const CourseDescriptionPanel = ({
  className,
  courseCode,
  onCourseClick,
  courses
}: CourseDescriptionPanelProps) => {
  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  const coursesUnlockedQuery = useUserCoursesUnlockedWhenTaken({}, courseCode);

  const courseQuery = useCourseInfoQuery({}, courseCode);
  const coursePrereqsQuery = useCoursePrereqsQuery({}, courseCode);
  const courseCapacityQuery = useCourseTimetableQuery(
    { queryOptions: { select: getEnrolmentCapacity, retry: 1, enabled: sidebar } }, // retry only once because we have bad error handling
    courseCode
  );
  const ratingQuery = useCourseRatingQuery({}, courseCode);

  const loadingWrapper = (
    <S.Wrapper $sidebar={sidebar}>
      {!sidebar ? <LoadingCourseDescriptionPanelSidebar /> : <LoadingCourseDescriptionPanel />}
    </S.Wrapper>
  );

  if (
    courseQuery.isPending ||
    coursePrereqsQuery.isPending ||
    (sidebar && courseCapacityQuery.isPending)
  )
    return loadingWrapper;

  const course = courseQuery.data;
  const coursesPathFrom = coursePrereqsQuery.data?.courses;
  const courseCapacity = courseCapacityQuery.data;

  const rating = ratingQuery?.data;

  // course wasn't fetchable (fatal; should do proper error handling instead of indefinitely loading)
  if (!course) return loadingWrapper;
  return (
    <S.Wrapper $sidebar={sidebar} className={className}>
      <S.MainWrapper>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          <S.TitleWrapper $sidebar={sidebar}>
            <div>
              <Title level={2} className="text">
                {courseCode} - {course.title}
              </Title>
            </div>
          </S.TitleWrapper>
          <div style={{ paddingBottom: '.8rem' }}>
            <PlannerButton
              course={course}
              isAddedInPlanner={courses !== undefined && courses[course.code] !== undefined}
            />
          </div>
        </div>
        {course.is_legacy && (
          <Text strong>
            NOTE: this course is discontinued - if a current course exists, pick that instead
          </Text>
        )}
        {!sidebar && (
          <div style={{ flexBasis: '25%' }}>
            <CourseAttributes course={course} />
          </div>
        )}
        <div>
          <Rate disabled value={rating?.overallRating ? rating.overallRating : 0} allowHalf />
          <S.Link
            href={`https://unilectives.devsoc.app/course/${courseCode}/`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block' }}
          >
            Read reviews on Unilectives
          </S.Link>
        </div>
        <CourseInfoDrawers
          course={course}
          pathFrom={coursesPathFrom}
          unlocked={coursesUnlockedQuery.data}
          onCourseClick={onCourseClick}
        />
      </S.MainWrapper>

      {sidebar && (
        <S.SidebarWrapper>
          <CourseAttributes course={course} courseCapacity={courseCapacity} />
        </S.SidebarWrapper>
      )}
    </S.Wrapper>
  );
};

export default React.memo(CourseDescriptionPanel);
