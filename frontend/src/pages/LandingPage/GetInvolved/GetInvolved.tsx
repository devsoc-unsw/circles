import React from 'react';
import { Button } from 'antd';
import PageContainer from 'styles/PageContainer';
import { FEEDBACK_LINK } from 'config/constants';
import S from './styles';

const GetInvolved = () => {
  return (
    <PageContainer>
      <S.Title>Interested in Circles?</S.Title>
      <S.ContentWrapper>
        If you&apos;re a CSE student with a keen interest in Circles and looking to get involved,
        keep an eye out for our recruitment announcements on CSESoc&apos;s socials. Otherwise, you
        can also contribute by suggesting cool new features, report any bugs or even make a pull
        request on the Circles repo.
      </S.ContentWrapper>
      <S.LinksWrapper>
        <Button href={FEEDBACK_LINK} target="_blank" rel="noreferrer" size="large" type="primary">
          Feedback
        </Button>
        <Button
          href="https://github.com/csesoc/circles"
          target="_blank"
          rel="noreferrer"
          size="large"
          type="primary"
        >
          Github
        </Button>
      </S.LinksWrapper>
    </PageContainer>
  );
};

export default GetInvolved;
