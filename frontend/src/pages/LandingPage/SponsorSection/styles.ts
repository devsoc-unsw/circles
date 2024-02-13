import styled from 'styled-components';

const SponsorsText = styled.h1`
  font-size: 30px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  margin-bottom: 15px;
  font-weight: 650;
  padding-top: 15px;
`;

const LogosWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
`;

const LogoImg = styled.img`
  height: 100px;
`;

export default {
  SponsorsText,
  LogosWrapper,
  LogoImg
};
