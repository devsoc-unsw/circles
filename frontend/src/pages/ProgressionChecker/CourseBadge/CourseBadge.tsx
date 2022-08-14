import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, ExclamationOutlined, EyeOutlined } from '@ant-design/icons';
import { Badge, Tooltip } from 'antd';
import CourseButton from 'components/CourseButton';
import { purple } from 'config/constants';
import S from './styles';

type UOCBadgeProps = {
  uoc: number
};

const UOCBadge = ({ uoc }: UOCBadgeProps) => (
  <S.UOCBadgeWrapper>
    <Badge
      style={{
        backgroundColor: purple, color: 'white', lineHeight: '1.5', height: 'auto',
      }}
      size="small"
      count={`${uoc} UOC`}
    />
  </S.UOCBadgeWrapper>
);

type Props = {
  courseCode: string
  title: string
  past: boolean
  termPlanned: string
  uoc: number
  unplanned: boolean
};

const CourseBadge = ({
  past, courseCode, title, unplanned, uoc, termPlanned,
}: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/term-planner');
  };

  if (unplanned) {
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

  if (past) {
    return (
      <Badge
        count={(
          <Tooltip title={`Course planned for ${termPlanned}`}>
            <S.CourseBadgeIcon onClick={handleClick}>
              <CalendarOutlined />
            </S.CourseBadgeIcon>
          </Tooltip>
          )}
      >
        <CourseButton courseCode={courseCode} title={title} planned />
        <UOCBadge uoc={uoc} />
      </Badge>
    );
  }

  // for future courses planned
  // past can be undefined if not in term planner thus check for false
  if (past === false) {
    return (
      <Badge
        count={(
          <Tooltip title={`Course will be taken in ${termPlanned}`}>
            <S.CourseBadgeIcon onClick={handleClick}>
              <EyeOutlined />
            </S.CourseBadgeIcon>
          </Tooltip>
        )}
      >
        <CourseButton courseCode={courseCode} title={title} planned />
        <UOCBadge uoc={uoc} />
      </Badge>
    );
  }

  // below is default badge for courses not in term planner
  return <CourseButton courseCode={courseCode} title={title} />;
};

export default CourseBadge;
