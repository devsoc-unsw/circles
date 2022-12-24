import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  padding: 10px;
`;

const TitleWrapper = styled.div`
  text-align: center;
`;

const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
`;

const ImageStep = styled.img`
  display: block;
  align-self: center;
  width: 70%;
`;

export default {
  Wrapper,
  TitleWrapper,
  ContentsWrapper,
  ImageStep
};
