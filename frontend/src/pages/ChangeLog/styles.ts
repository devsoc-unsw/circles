import { Typography } from 'antd';
import styled from 'styled-components';

const { Text } = Typography;

const ContainerWrapper = styled.div`
  padding: 2rem;
  max-width: 1500px;
  margin: auto;
`;

const TextBlock = styled(Text)`
  display: block;
  color: ${({ theme }) => theme.graph.tabTextColor};
`;

export default { ContainerWrapper, TextBlock };
