import React, { Suspense } from 'react';
import { useContextMenu } from 'react-contexify';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { useTheme } from 'styled-components';
import { Course } from 'types/api';
import { Term } from 'types/planner';
import { badPlanner, CoursesResponse, PlannerResponse } from 'types/userResponse';
import { getUserPlanner } from 'utils/api/userApi';
import { courseHasOffering } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import ContextMenu from '../ContextMenu';
import S from './styles';
import { CourseTime } from 'types/courses';

type Props = {
  planner: PlannerResponse;
  courses: CoursesResponse;
  course: Course;
  index: number;
  time?: CourseTime;
};

const Draggable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Draggable }))
);

const DraggableCourse = ({ planner, courses, course, index, time }: Props) => {
  const { isSummerEnabled } = planner;
  const { showMarks } = useSelector((state: RootState) => state.settings);
  const theme = useTheme();
  const { Text } = Typography;

  // prereqs are populated in CourseDescription.jsx via course.raw_requirements
  const { title } = course;
  // TODO: Change the backend so that naming is universally in camelCase so we don't have to do this
  // TODO: plannedFor seemed important. What did it do? Does it matter that it is gone now?
  const isLegacy = course.is_legacy;
  const isAccurate = course.is_accurate;
  const handbookNote = course.handbook_note;
  // const warningMessage = courses[code].warnings;

  const showNotOfferedWarning = time
    ? courseHasOffering(course, time.year, time.term as Term)
    : true;

  const contextMenu = useContextMenu({
    id: `${course.code}-context`
  });

  // TODO: const isDragDisabled = !!plannedFor && !!completedTerms[plannedFor];
  const isDragDisabled = false;

  const isSmall = useMediaQuery('(max-width: 1400px)');
  // TODO: Most of the information for these is missing now. Should it be brought back?
  // const shouldHaveWarning =
  //   !supressed && (isLegacy || !isUnlocked || BEwarnings || !isAccurate || !showNotOfferedWarning);
  // const errorIsInformational =
  //   shouldHaveWarning &&
  //   isUnlocked &&
  //   warningMessage.length === 0 &&
  //   !is_legacy &&
  //   is_accurate &&
  //   showNotOfferedWarning;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isDragDisabled) contextMenu.show({ event: e });
  };

  return (
    <>
      <Suspense fallback={<Spinner text="Loading Course..." />}>
        <Draggable
          isDragDisabled={isDragDisabled}
          draggableId={`${course.code}${time?.term}`}
          index={index}
        >
          {(provided) => (
            <S.CourseWrapper
              summerEnabled={isSummerEnabled}
              isSmall={isSmall}
              dragDisabled={isDragDisabled}
              warningsDisabled={isDragDisabled}
              // isWarning={!supressed && (!isUnlocked || !showNotOfferedWarning)}
              isWarning={false}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              style={provided.draggableProps.style}
              data-tip
              data-for={course.code}
              id={course.code}
              onContextMenu={handleContextMenu}
            >
              {/* {!isDragDisabled &&
                shouldHaveWarning &&
                (errorIsInformational ? (
                  <InfoCircleOutlined style={{ color: theme.infoOutlined.color }} />
                ) : (
                  <WarningOutlined
                    style={{ fontSize: '16px', color: theme.warningOutlined.color }}
                  />
                ))} */}
              <S.CourseLabel>
                {isSmall ? (
                  <Text className="text">{course.code}</Text>
                ) : (
                  <div>
                    <Text className="text">
                      <strong>{course.code}: </strong>
                      {title}
                    </Text>
                  </div>
                )}
                {showMarks && (
                  <div>
                    <Text strong className="text">
                      Mark:&nbsp;
                    </Text>
                    <Text className="text">
                      {/*
                          Marks can be strings (i.e. HD, CR) or a number (i.e. 90, 85).
                          Mark can be 0.
                        */}
                      {typeof courses[course.code].mark != undefined
                        ? courses[course.code].mark
                        : 'N/A'}
                    </Text>
                  </div>
                )}
              </S.CourseLabel>
            </S.CourseWrapper>
          )}
        </Draggable>
      </Suspense>
      <ContextMenu code={course.code} plannedFor={null} />
      {/* display prereq tooltip for all courses. However, if a term is marked as complete
        and the course has no warning, then disable the tooltip */}
      {isSmall && (
        <ReactTooltip id={course.code} place="top" effect="solid">
          {title}
        </ReactTooltip>
      )}
      {!isDragDisabled && shouldHaveWarning && (
        <ReactTooltip id={course.code} place="bottom">
          {isLegacy ? (
            'This course is discontinued. If an equivalent course is currently being offered, please pick that instead.'
          ) : !showNotOfferedWarning ? (
            'The course is not offered in this term.'
          ) : (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: handbookNote }} />
          )}
          {!isAccurate ? ' The course info may be inaccurate.' : ''}
        </ReactTooltip>
      )}
    </>
  );
};

export default DraggableCourse;
