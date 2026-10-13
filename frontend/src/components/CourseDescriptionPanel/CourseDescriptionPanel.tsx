import React from 'react';
import { useLocation } from 'react-router-dom';
import { Rate, Typography } from 'antd';
import { CoursesResponse } from 'types/userResponse';
import {
  useCourseInfoQuery,
  useCoursePrereqsQuery,
  useCourseRatingQuery,
  usePopularElectivesQuery
} from 'utils/apiHooks/static';
import { useUserCoursesUnlockedWhenTaken, useUserDegree } from 'utils/apiHooks/user';
import {
  LoadingCourseDescriptionPanel,
  LoadingCourseDescriptionPanelSidebar
} from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import PopularityTag from 'components/PopularityTag';
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
  const ratingQuery = useCourseRatingQuery({}, courseCode);

  const degreeQuery = useUserDegree();
  const degree = degreeQuery.data;
  const popularElectivesQuery = usePopularElectivesQuery(
    {
      queryOptions: { enabled: degree !== undefined }
    },
    degree?.programCode ?? '',
    degree?.specs ?? []
  );
  const popularityCount = popularElectivesQuery.data?.popular.find(
    (elective) => elective.courseCode === courseCode
  )?.count;

  const loadingWrapper = (
    <S.Wrapper $sidebar={sidebar}>
      {!sidebar ? <LoadingCourseDescriptionPanelSidebar /> : <LoadingCourseDescriptionPanel />}
    </S.Wrapper>
  );

  if (courseQuery.isPending || coursePrereqsQuery.isPending) return loadingWrapper;

  const course = courseQuery.data;
  const coursesPathFrom = coursePrereqsQuery.data?.courses;
  const rating = ratingQuery?.data;

  // course wasn't fetchable (fatal; should do proper error handling instead of indefinitely loading)
  if (!course) return loadingWrapper;
  return (
    <S.Wrapper $sidebar={sidebar} className={className}>
      <S.MainWrapper>
        <S.HeaderWrapper>
          <S.TitleWrapper $sidebar={sidebar}>
            <div>
              <Title level={2} className="text">
                {courseCode} - {course.title}
                {popularityCount !== undefined && (
                  <>
                    {' '}
                    <PopularityTag count={popularityCount} withLabel />
                  </>
                )}
              </Title>
            </div>
          </S.TitleWrapper>
          <S.PlannerWrapper>
            <PlannerButton
              course={course}
              isAddedInPlanner={courses !== undefined && courses[course.code] !== undefined}
            />
          </S.PlannerWrapper>
        </S.HeaderWrapper>
        {course.is_legacy && (
          <Text strong>
            NOTE: this course is discontinued - if a current course exists, pick that instead
          </Text>
        )}
        {!sidebar && (
          <S.SidebarWrapper>
            <CourseAttributes course={course} />
          </S.SidebarWrapper>
        )}
        <div>
          <Rate value={rating?.overallRating ? rating.overallRating : 0} allowHalf />
          <div>
            <a
              href={`https://unilectives.devsoc.app/course/${courseCode}/`}
              target="_blank"
              rel="noreferrer"
            >
              Read reviews on Unilectives
            </a>
          </div>
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
          <CourseAttributes course={course} />
        </S.SidebarWrapper>
      )}
    </S.Wrapper>
  );
};

export default React.memo(CourseDescriptionPanel);
