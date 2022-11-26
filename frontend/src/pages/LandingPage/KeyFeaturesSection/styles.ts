import styled from 'styled-components';

const FeatureTitle = styled.h1`
  font-size: 50px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: space-evenly;
  position: relative;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  display: inline-block;
  height: 275px;
  margin: 1rem;
  position: relative;
  width: 250px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  padding: 45px 25px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
`;

const IconContainer = styled.div`
  height: 66px;
  width: 66px;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  background: ${({ color }) => color};
`;

const FeatureSubtitle = styled.h3<{ startColor: string; endColor: string }>`
  font-size: 20px;
  background: -webkit-linear-gradient(
    45deg,
    ${({ startColor }) => startColor},
    ${({ endColor }) => endColor}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  line-height: 15px;
`;

const BlobContainer = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 75%;
  left: 50%;
`;

export default {
  FeatureTitle,
  CardContainer,
  Card,
  IconContainer,
  FeatureSubtitle,
  Divider,
  Content,
  BlobContainer
};
