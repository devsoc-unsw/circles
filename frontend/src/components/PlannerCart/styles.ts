import styled from 'styled-components';

const PlannerCartRoot = styled.div`
  margin: 10px;
  position: relative;
  z-index: 20;
`;

const PlannerCartContainer = styled.div`
  padding: 20px;
  position: absolute;
  min-height: 200px;
  height: 380px;
  width: 320px;
  top: 35px;
  right: 0px;
  border-radius: 5px;
  border: #f5f5f5 solid 1px;
  background-color: ${({ theme }) => theme.plannerCartMenu.backgroundColor};
`;

const CartContentWrapper = styled.div`
  padding: 15px 0;
  margin-bottom: 15px;
  overflow-y: auto;
  height: 75%;
  border-top: #f4f4f4 solid 1px;
`;

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: space-between;
`;

export default {
  PlannerCartRoot,
  PlannerCartContainer,
  CartContentWrapper,
  EmptyWrapper
};
