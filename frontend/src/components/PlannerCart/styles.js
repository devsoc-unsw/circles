import { Button as Btn } from "antd";
import styled from "styled-components";

const plannerCartRoot = styled.div`
margin: 10px;
position: relative;
z-index: 20;
`;

const plannerCartMenu = styled.div`
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
  background-color: #ffffff;
`;

const plannerCartContent = styled.div`
  padding: 5px;
  padding-left: 0px;
  overflow-y: auto;
  height: 70%;
  border-top: #f4f4f4 solid 1px;
`;

const plannerCartEmptyCont = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const plannerCartCard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  border-radius: 10px;

  :hover {
    background-color: #f4f4f4;
  }
`;

const delButton = styled(Btn)`
  margin-top: 15px;
  width: 260px;
`;

const linkButton = styled(Btn)`
  margin-top: 70px;
  margin: 30px;
  margin-left: 20px;
`;

export default {
  plannerCartRoot,
  plannerCartMenu,
  plannerCartContent,
  plannerCartEmptyCont,
  delButton,
  linkButton,
  plannerCartCard,
};
