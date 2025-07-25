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

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const LogosWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  width: 100%;

  @media (max-width: 768px) {
    gap: 2rem;
    padding: 0 1rem;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const LogoImg = styled.img<{ size: string }>`
  max-width: ${(props) => props.size};
  height: auto;
  object-fit: contain;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    max-width: ${(props) => {
      switch (props.size) {
        case '350px':
          return '250px';
        case '250px':
          return '180px';
        case '150px':
          return '120px';
        default:
          return props.size;
      }
    }};
  }

  @media (max-width: 480px) {
    max-width: ${(props) => {
      switch (props.size) {
        case '350px':
          return '200px';
        case '250px':
          return '150px';
        case '150px':
          return '100px';
        default:
          return props.size;
      }
    }};
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

  @media (max-width: 768px) {
    gap: 1.5rem;

    &:not(:last-child) {
      padding-bottom: 2rem;
    }
  }

  @media (max-width: 480px) {
    gap: 1rem;

    &:not(:last-child) {
      padding-bottom: 1.5rem;
    }
  }
`;

export default {
  SponsorsText,
  LogosWrapper,
  LogoImg,
  TierWrapper
};
