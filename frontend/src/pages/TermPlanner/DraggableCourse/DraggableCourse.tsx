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
import { badPlanner, PlannerResponse } from 'types/userResponse';
import { getUserPlanner } from 'utils/api/userApi';
import { courseHasOfferingNew } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import ContextMenu from '../ContextMenu';
import S from './styles';

type Props = {
  course: Course;
  index: number;
  term: string;
};

const Draggable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Draggable }))
);

const DraggableCourse = ({ course, index, term }: Props) => {
  const plannerQuery = useQuery('planner', getUserPlanner);
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;

  // TODO: Work out how isSummerEnabled works with the new backend
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

  const isOffered = courseHasOfferingNew(course, term as Term);

  const contextMenu = useContextMenu({
    id: `${course.code}-context`
  });

  // const isDragDisabled = !!plannedFor && !!completedTerms[plannedFor];
  const isDragDisabled = false;

  const isSmall = useMediaQuery('(max-width: 1400px)');
  // TODO: Most of the information for these is missing now. Should it be brought back?
  // const shouldHaveWarning =
  //   !supressed && (isLegacy || !isUnlocked || BEwarnings || !isAccurate || !isOffered);
  // const errorIsInformational =
  //   shouldHaveWarning &&
  //   isUnlocked &&
  //   warningMessage.length === 0 &&
  //   !is_legacy &&
  //   is_accurate &&
  //   isOffered;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isDragDisabled) contextMenu.show({ event: e });
  };

  return (
    <>
      <Suspense fallback={<Spinner text="Loading Course..." />}>
        <Draggable
          isDragDisabled={isDragDisabled}
          draggableId={`${course.code}${term}`}
          index={index}
        >
          {(provided) => (
            <S.CourseWrapper
              summerEnabled={isSummerEnabled}
              isSmall={isSmall}
              dragDisabled={isDragDisabled}
              warningsDisabled={isDragDisabled}
              // isWarning={!supressed && (!isUnlocked || !isOffered)}
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
              <InfoCircleOutlined style={{ color: theme.infoOutlined.color }} />
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
                      {/* TODO: Bring back marks */}
                      {/* {typeof mark === 'string' || typeof mark === 'number' ? mark : 'N/A'} */}
                      N/A
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
      {!isDragDisabled && (
        <ReactTooltip id={course.code} place="bottom">
          {isLegacy ? (
            'This course is discontinued. If an equivalent course is currently being offered, please pick that instead.'
          ) : !isOffered ? (
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
