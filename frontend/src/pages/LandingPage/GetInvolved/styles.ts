import styled from 'styled-components';

const Title = styled.h1`
  font-size: 50px;
  margin-bottom: 3rem;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  font-weight: 700;
`;

const ContentWrapper = styled.div`
  text-align: center;
  font-size: 1rem;
`;

const LinksWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 100px;
  margin-top: 40px;
  margin-bottom: 100px;
`;

export default {
  Title,
  ContentWrapper,
  LinksWrapper
};
