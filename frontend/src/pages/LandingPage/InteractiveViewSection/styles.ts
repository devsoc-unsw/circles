import styled from 'styled-components';

const InteractiveViewContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 200px 0;
`;

const InteractiveViewTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 370px;
`;

const InteractiveViewTitle = styled.h1`
  font-size: 40px;
  display: flex;
  gap: 10px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  font-weight: 600;
`;

const InteractiveViewText = styled.p`
  font-size: 15px;
  color: #acacac;
`;

const GradientBox = styled.img`
  width: 500px;
  height: 500px;
  border-radius: 20px;
  background: -webkit-linear-gradient(#eeddff, #faeef5, #ffffff);
  padding: 30px;
`;

export default {
  InteractiveViewContainer,
  InteractiveViewTextContainer,
  InteractiveViewTitle,
  InteractiveViewText,
  GradientBox
};
