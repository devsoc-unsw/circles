import React, { FunctionComponent } from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';
import picture from 'assets/helpGifs/additional-options.jpg';

const S = {
  Wrapper: styled.div`
    width: 100%;
    padding: 10px;
  `,

  TitleWrapper: styled.div`
    text-align: center;
  `,

  ContentsWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  `,

  ImageStep: styled.img`
    display: block;
    align-self: center;
    width: 70%;
  `,
};

const { Title, Text } = Typography;

const HowToUse: FunctionComponent = () => (
  <S.Wrapper>
    <S.TitleWrapper>
      <Title level={2} className="text">How to use the Graphical Selector</Title>
    </S.TitleWrapper>

    <S.ContentsWrapper>
      <div>
        <Text>1. Navigate the graph to find available courses.</Text>
      </div>
      <S.ImageStep src={picture} alt="helloooo" />
      <div>
        <Text>2. Use the search bar to bring up the courses.</Text>
      </div>
      <S.ImageStep src={picture} alt="helloooo" />
      <div>
        <Text>3. Click the course to view the course information!</Text>
      </div>
      <S.ImageStep src={picture} alt="helloooo" />
    </S.ContentsWrapper>
  </S.Wrapper>
);

export default HowToUse;
