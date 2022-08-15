import { animated } from '@react-spring/web';
import Skeleton from 'antd/lib/skeleton';
import styled from 'styled-components';

const DashboardWrapper = styled(animated.div)`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const CardsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const DegreeCardWrapper = styled(Skeleton.Button)`
  width: 300px;
  height: 8em;
`;

export default { CardsWrapper, DashboardWrapper, DegreeCardWrapper };
