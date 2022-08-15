import antdCard from 'antd/lib/card';
import styled from 'styled-components';

const Card = styled(antdCard)`
  width: 300px;
  background-color: ${({ theme }) => theme.degreeCard.backgroundColor};
`;

const TooltipText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default { Card, TooltipText };
