import React from 'react';
import { useSelector } from 'react-redux';
import { BugOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FEEDBACK_LINK } from 'config/constants';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import S from './styles';

const FeedbackButton = () => {
  // Feedback form
  const isTablet = useMediaQuery('(max-width: 1000px)');
  const openFeedbackLink = () => {
    window.open(FEEDBACK_LINK, '_blank');
  };
  const { theme } = useSelector((state: RootState) => state.settings);

  // Move this to the drawer if the screen is too small
  return isTablet ? null : (
    <S.FeedbackBtnWrapper>
      <Tooltip title="Report a bug!">
        <S.Button
          shape="circle"
          icon={<BugOutlined style={{ color: theme === 'light' ? '#323739' : '#f1f1f1' }} />}
          size="large"
          onClick={() => openFeedbackLink()}
        />
      </Tooltip>
    </S.FeedbackBtnWrapper>
  );
};

export default FeedbackButton;
