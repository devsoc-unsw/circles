import styled from "styled-components";

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: ${({ theme }) => theme.purplePrimary};
  height: var(--navbar-height);
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export default { HeaderWrapper, LogoWrapper, HeaderContent };
