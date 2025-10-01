import styled from 'styled-components';

const FeatureTitle = styled.h1`
  font-size: 50px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  margin-bottom: 75px;
  font-weight: 650;
  margin-top: 90px;

  @media (max-width: 800px) {
    font-size: 36px;
    margin-bottom: 50px;
    margin-top: 60px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 40px;
    margin-top: 40px;
  }
`;

const CardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 30px;
  position: relative;
  margin-bottom: 200px;

  @media (max-width: 800px) {
    gap: 1.25rem;
    margin-bottom: 100px;
    padding: 0 16px;
  }

  @media (max-width: 480px) {
    gap: 16px;
    margin-bottom: 60px;
    padding: 0 12px;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 1.25rem;
  height: 275px;
  position: relative;
  width: 250px;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.16),
    0 3px 6px rgba(0, 0, 0, 0.23);
  padding: 45px 25px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow:
      0 14px 28px rgba(0, 0, 0, 0.25),
      0 10px 10px rgba(0, 0, 0, 0.22);
  }

  @media (max-width: 800px) {
    width: 280px;
    height: 300px;
    padding: 35px 1.25rem;
  }

  @media (max-width: 480px) {
    width: 260px;
    height: 280px;
    padding: 30px 18px;
  }
`;

const IconContainer = styled.div`
  height: 65px;
  width: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background: ${({ color }) => color};
`;

const FeatureSubtitle = styled.h3<{ $startColor: string; $endColor: string }>`
  font-size: 1.25rem;
  background: -webkit-linear-gradient(
    45deg,
    ${({ $startColor }) => $startColor},
    ${({ $endColor }) => $endColor}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
`;

const Divider = styled.hr`
  width: 80%;
  height: 6px;
  border-radius: 2px;
  border: 0 none;
  margin: 10px 0px;
  background-color: ${({ color }) => color};
`;

const Content = styled.p`
  font-size: 13px;
  color: #c8bfbf;
  letter-spacing: -0.3px;
  line-height: 1.2rem;
`;

const BlobBackground = styled.img`
  width: 100%;
  position: absolute;
  transform: translate(-50%, -50%);
  top: 65%;
  left: 50%;

  @media (max-width: 902px) {
    top: 50%;
  }

  @media (max-width: 800px) {
    width: 120%;
    top: 45%;
  }

  @media (max-width: 480px) {
    width: 140%;
    top: 40%;
  }
`;

export default {
  FeatureTitle,
  CardsSection,
  Card,
  IconContainer,
  FeatureSubtitle,
  Divider,
  Content,
  BlobBackground
};
