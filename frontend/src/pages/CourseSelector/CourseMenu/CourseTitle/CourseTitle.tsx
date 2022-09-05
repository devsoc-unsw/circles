import React from 'react';
import {
  LockOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import QuickCart from 'components/QuickAddCartButton';
import useMediaQuery from 'hooks/useMediaQuery';
import S from './styles';

type Props = {
  courseCode: string
  selected: boolean
  accurate: boolean
  unlocked: boolean
  title: string
};

const CourseTitle = ({
  courseCode, selected, accurate, unlocked, title,
}: Props) => {
  const isSmall = useMediaQuery('(max-width: 1400px)');

  return (
    <S.Wrapper>
      {isSmall ? (
        <Tooltip title={title} placement="topLeft">
          <S.CourseTitleWrapper selected={selected} locked={!unlocked}>
            {courseCode}
          </S.CourseTitleWrapper>
        </Tooltip>
      ) : (
        <S.CourseTitleWrapper selected={selected} locked={!unlocked}>
          {courseCode}: {title}
        </S.CourseTitleWrapper>
      )}
      <S.IconsWrapper>
        {!accurate && (
          <Tooltip
            placement="top"
            title="We couldn't parse the requirement for this course. Please manually check if you have the correct prerequisites to unlock it."
          >
            <WarningOutlined
              style={{
                color: '#DC9930',
                fontSize: '16px',
              }}
            />
          </Tooltip>
        )}
        {!unlocked && <LockOutlined style={{ fontSize: '12px' }} />}
        <QuickCart
          courseCode={courseCode}
          planned={selected}
        />
      </S.IconsWrapper>
    </S.Wrapper>
  );
};

export default CourseTitle;
