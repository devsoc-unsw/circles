import { Card as antdCard, Skeleton } from "antd";
import styled from "styled-components";

const Card = styled(antdCard)`
  width: 300px;
  background-color: ${({ theme }) => theme.degreeCard.backgroundColor};
`;

const SkeletonCard = styled(Skeleton.Button)`
  width: 300px;
  height: 8em;
`;

const TooltipText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default { Card, TooltipText, SkeletonCard };
