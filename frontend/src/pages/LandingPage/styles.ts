import styled from 'styled-components';

const LandingPageContainer = styled.div`
  margin-top: 30px;
`;
const LandingPageTitle = styled.h1`
  font-size: 50px;
  background: -webkit-linear-gradient(45deg, #9f62de, #b77eff);
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

const iconContainer = styled.div`
  height: 66px;
  width: 66px;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  background: ${({ color }) => color};
`;

const dragTitle = styled.h3`
  font-size: 20px;
  background: -webkit-linear-gradient(45deg, #cabade, #9e88ba);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
const flagTitle = styled.h3`
  font-size: 20px;
  background: -webkit-linear-gradient(45deg, #9b5dea, #dbe2fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
const padlockTitle = styled.h3`
  font-size: 20px;
  background: -webkit-linear-gradient(45deg, #9fecae, #93d392);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const divider = styled.hr`
  width: 80%;
  height: 6px;
  border-radius: 2px;
  border: 0 none;
  margin: 10px 0px;
  background-color: #c3b3c9;
`;

const content = styled.p`
  font-size: 13px;
  color: #c8bfbf;
  letter-spacing: -0.3px;
  line-height: 15px;
`;

const InteractiveViewContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 120px;
  margin: 250px 0px;
`;

const InteractiveViewTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 370px;
`;

const InteractiveViewTitle = styled.h1`
  font-size: 40px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-top: 30px;
  position: relative;
  font-weight: 600;
`;

const InteractiveViewText = styled.p`
  font-size: 15px;
  color: #acacac;
`;

const gradientBox = styled.div`
  width: 418px;
  height: 418px;
  border-radius: 20px;
  background: -webkit-linear-gradient(#eeddff, #faeef5, #ffffff);
`;

export default {
  LandingPageContainer,
  LandingPageTitle,
  CardContainer,
  Card,
  iconContainer,
  dragTitle,
  flagTitle,
  padlockTitle,
  divider,
  content,
  InteractiveViewContainer,
  InteractiveViewTextContainer,
  InteractiveViewTitle,
  InteractiveViewText,
  gradientBox
};
