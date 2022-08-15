import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ExclamationOutlined from '@ant-design/icons/ExclamationOutlined';
import Badge from 'antd/lib/badge';
import Tooltip from 'antd/lib/tooltip';
import getNumTerms from 'utils/getNumTerms';
import CourseButton from 'components/CourseButton';
import { purple } from 'config/constants';
import S from './styles';

type UOCBadgeProps = {
  uoc: number
  isMultiterm: boolean
};

const UOCBadge = ({ uoc, isMultiterm }: UOCBadgeProps) => (
  <S.UOCBadgeWrapper>
    <Badge
      style={{
        backgroundColor: purple, color: 'white', lineHeight: '1.5', height: 'auto',
      }}
      size="small"
      count={isMultiterm ? `${getNumTerms(uoc, isMultiterm)} × ${uoc} UOC` : `${uoc} UOC`}
    />
  </S.UOCBadgeWrapper>
);

type Props = {
  courseCode: string
  title: string
  plannedFor: string
  uoc: number
  isUnplanned: boolean
  isMultiterm: boolean
  isDoubleCounted: boolean
};

const CourseBadge = ({
  courseCode, title, isUnplanned, uoc, plannedFor, isMultiterm, isDoubleCounted,
}: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/term-planner');
  };

  if (isUnplanned) {
    // course in term planner but has not been planned
    return (
      <Badge
        count={(
          <Tooltip title="Course has not been planned">
            <S.CourseBadgeIcon onClick={handleClick}>
              <ExclamationOutlined />
            </S.CourseBadgeIcon>
          </Tooltip>
          )}
      >
        <CourseButton courseCode={courseCode} title={title} />
      </Badge>
    );
  }

  if (plannedFor && isDoubleCounted) {
    return (
      <Badge
        count={(
          <Tooltip title="Course has been counted previously. Progression for this course may be counted again. Please manually verify the accuracy of the progression checker.">
            <S.CourseBadgeIcon onClick={handleClick}>
              <ExclamationOutlined />
            </S.CourseBadgeIcon>
          </Tooltip>
        )}
      >
        <CourseButton courseCode={courseCode} title={title} planned />
        {uoc && <UOCBadge uoc={uoc} isMultiterm={isMultiterm} />}
      </Badge>
    );
  }

  if (plannedFor) {
    return (
      <Badge
        count={(
          <Tooltip title={`Course planned for ${plannedFor}`}>
            <S.CourseBadgeIcon onClick={handleClick}>
              <CalendarOutlined />
            </S.CourseBadgeIcon>
          </Tooltip>
          )}
      >
        <CourseButton courseCode={courseCode} title={title} planned />
        {uoc && <UOCBadge uoc={uoc} isMultiterm={isMultiterm} />}
      </Badge>
    );
  }

  // below is default badge for courses not in term planner
  return <CourseButton courseCode={courseCode} title={title} />;
};

export default CourseBadge;
