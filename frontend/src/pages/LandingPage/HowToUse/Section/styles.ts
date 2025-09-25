import styled from 'styled-components';

const LeftSubTitle = styled.div`
  flex: 1;
  font-size: 8rem;
  color: #efdbfe;
  margin-top: 3rem;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 5rem;
    margin-top: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 4rem;
    margin-top: 1.5rem;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  margin: 3rem 0 15rem 0;
  padding: 2rem 0;

  @media (max-width: 768px) {
    margin: 2rem 0 8rem 0;
    padding: 1.5rem 0;
  }

  @media (max-width: 480px) {
    margin: 1.5rem 0 5rem 0;
    padding: 1rem 0;
  }
`;

const ContentHeading = styled.h1`
  color: #efdbfe;
  font-weight: 700;
  font-size: 3rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const SubContent = styled.div`
  color: #fff;
  margin-top: 2rem;
  line-height: 2;
  font-size: 1.25rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 1.8;
    margin-top: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 1.6;
    margin-top: 1rem;
  }
`;

export default {
  LeftSubTitle,
  ContentContainer,
  ContentHeading,
  SubContent
};
