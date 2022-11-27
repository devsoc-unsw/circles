import styled from 'styled-components';

const FooterContainer = styled.div`
  margin-bottom: 0;
  background: -webkit-linear-gradient(rgba(145, 84, 222, 0) 14vh, rgba(145, 84, 222, 1) 14vh);
  @media all and (max-width: 1000px) {
    background: -webkit-linear-gradient(rgba(145, 84, 222, 0) 8vh, rgba(145, 84, 222, 1) 8vh);
  }
  @media all and (max-width: 550px) {
    background: -webkit-linear-gradient(rgba(145, 84, 222, 0) 4vh, rgba(145, 84, 222, 1) 4vh);
  }
`;

const FooterContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  padding: 0px 100px;
  gap: 80px;
  @media all and (max-width: 900px) {
    flex-wrap: wrap;
    gap: 30px;
  }
`;

const FooterContent = styled.div`
  display: flex;
`;

const StyledImg = styled.img`
  width: 100%;
`;

const StyledCSELogo = styled.img`
  width: 290px;
  height: 66px;
  @media all and (max-width: 900px) {
    width: 100%;
  }
`;

const FooterText = styled.p`
  color: white;
  font-size: 12px;
  padding-bottom: 100px;
  white-space: pre-line;
`;

const BottomLeft = styled.b`
  position: absolute;
  bottom: 50px;
  color: white;
`;

export default {
  FooterContainer,
  StyledImg,
  FooterContentContainer,
  FooterContent,
  StyledCSELogo,
  BottomLeft,
  FooterText
};
