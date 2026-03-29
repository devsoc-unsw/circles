import { Checkbox, Typography } from 'antd';
import styled from 'styled-components';

const NotificationSpan = styled.span`
  color: ${(props) => props.theme.text};
`;

const CoursesSelectWrapper = styled.div`
  .ant-select {
    width: 100%;
    margin-top: 12px;
  }
`;

const EndTermLabel = styled(Typography.Text)`
  display: block;
  margin-top: 16px;
`;

const EndTermSelectWrapper = styled.div`
  .ant-select {
    width: 100%;
    margin-top: 8px;
  }
`;

const LockCheckbox = styled(Checkbox)`
  margin-top: 16px;
`;

export default {
  NotificationSpan,
  CoursesSelectWrapper,
  EndTermLabel,
  EndTermSelectWrapper,
  LockCheckbox
};
