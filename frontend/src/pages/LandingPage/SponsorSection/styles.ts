import styled from 'styled-components';

const SponsorsText = styled.h1`
  font-size: 2rem;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  margin-bottom: 1rem;
  font-weight: 650;
`;

const LogosWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 4rem;
`;

const LogoImg = styled.img`
  height: 100px;
`;

export default {
  SponsorsText,
  LogosWrapper,
  LogoImg
};
