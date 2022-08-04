import { Button as antdButton } from "antd";
import styled from "styled-components";

const PlannerCartRoot = styled.div`
  margin: 10px;
  position: relative;
  z-index: 20;
`;

const PlannerCartMenu = styled.div`
  padding-top: 20px;
  padding-left: 20px;
  position: absolute;
  min-height: 200px;
  height: 380px;
  width: 300px;
  top: 35px;
  right: 0px;
  border-radius: 3px;
  box-shadow: 1px 2px #f0f0f0;
  border: #f5f5f5 solid 1px;
  background-color:${({ theme }) => theme.plannerCartMenu.backgroundColor}; 
`;

const PlannerCartContent = styled.div`
  padding: 5px;
  padding-left: 0px;
  overflow-y: auto;
  height: 70%;
  border-top: #f4f4f4 solid 1px;
`;

const PlannerCartEmptyCont = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const DelButton = styled(antdButton)`
  margin-top: 15px;
  width: 260px;
`;

const LinkButton = styled(antdButton)`
  margin-top: 70px;
  margin: 30px;
  margin-left: 20px;
`;

export default {
  PlannerCartRoot,
  PlannerCartMenu,
  PlannerCartContent,
  PlannerCartEmptyCont,
  DelButton,
  LinkButton,
};
