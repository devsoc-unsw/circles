import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, ExclamationOutlined } from '@ant-design/icons';
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
  plannedFor?: string | null
  uoc?: number | null
  isUnplanned?: boolean
};

const CourseBadge = ({
  courseCode, title, isUnplanned, uoc, plannedFor,
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
        {uoc && <UOCBadge uoc={uoc} />}
      </Badge>
    );
  }

  // below is default badge for courses not in term planner
  return <CourseButton courseCode={courseCode} title={title} />;
};

export default CourseBadge;
