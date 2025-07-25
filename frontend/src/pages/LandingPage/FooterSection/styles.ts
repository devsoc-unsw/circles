import styled from 'styled-components';

const FooterBlob = styled.img`
  width: 100%;
`;

const FooterWrapper = styled.div`
  background-color: #9154de;
  /* TODO: Hack coz of pixel diff between blob and footer content */
  margin-top: -1px;
`;

const FooterContentContainer = styled.div`
  position: relative;
  display: flex;
  color: #fff;
  justify-content: space-between;
  padding: 40px 0;
  gap: 75px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
    padding: 30px 0;
    text-align: center;
  }

  @media (max-width: 480px) {
    gap: 30px;
    padding: 20px 0;
  }
`;

const FooterLogoWrapper = styled.div`
  width: 270px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 50px;

  @media (max-width: 768px) {
    width: 100%;
    align-items: center;
    gap: 30px;
  }

  @media (max-width: 480px) {
    gap: 20px;
  }
`;

const DevSocLogo = styled.img`
  width: 100%;

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    width: 160px;
  }
`;

const FooterDisclaimer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;

  @media (max-width: 768px) {
    text-align: left;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 14px;
    font-size: 0.9rem;
  }
`;

export default {
  FooterBlob,
  FooterContentContainer,
  FooterLogoWrapper,
  FooterDisclaimer,
  FooterWrapper,
  DevSocLogo
};
