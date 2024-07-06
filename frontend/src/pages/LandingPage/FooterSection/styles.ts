import styled from 'styled-components';

const FooterBlob = styled.img`
  width: 100%;
`;

const FooterContentBody = styled.div`
  background-color: #9154de;
`;

const FooterContentContainer = styled.div`
  position: relative;
  display: flex;
  color: #fff;
  justify-content: space-between;
  padding: 40px 0;
  gap: 75px;
  flex-wrap: wrap;
`;

const FooterLogoWrapper = styled.div`
  width: 270px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 50px;
`;

const DevSocLogo = styled.img`
  width: 100%;
`;

const FooterDisclaimer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
`;

export default {
  FooterBlob,
  FooterContentContainer,
  FooterLogoWrapper,
  FooterDisclaimer,
  FooterContentBody,
  DevSocLogo
};
