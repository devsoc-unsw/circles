import { Typography } from 'antd';
import styled from 'styled-components';

const NotificationSpan = styled.span`
  color: ${(props) => props.theme.text};
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

export default {
  NotificationSpan,
  EndTermLabel,
  EndTermSelectWrapper
};
