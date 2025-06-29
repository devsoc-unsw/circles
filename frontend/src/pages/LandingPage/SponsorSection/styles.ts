import styled from 'styled-components';

const SponsorsText = styled.h1`
  font-size: 2rem;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  margin-bottom: 2rem;
  font-weight: 650;
`;

const LogosWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  width: 100%;
`;

const LogoImg = styled.img<{ size: string }>`
  max-width: ${(props) => props.size};
  height: auto;
  object-fit: contain;
  transition: transform 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const TierWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 100%;
  flex-wrap: wrap;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 3rem;
  }
`;

export default {
  SponsorsText,
  LogosWrapper,
  LogoImg,
  TierWrapper
};
