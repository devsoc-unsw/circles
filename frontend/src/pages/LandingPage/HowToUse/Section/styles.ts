import styled from 'styled-components';

const LeftSubTitle = styled.div`
  flex: 1;
  font-size: 8rem;
  color: #9df6fc;
  margin-top: 3rem;
  font-weight: 800;
`;

const ContentContainer = styled.div`
  flex: 1;
  margin: 3rem 0 15rem 0;
  padding: 2rem;
`;

const ContentHeading = styled.h1`
  color: #d4ffdc;
  font-weight: 700;
  font-size: 3rem;
`;

const SubContent = styled.div`
  color: #fff;
  margin-top: 2rem;
  line-height: 2;
  font-size: 20px;
  font-weight: 500;
`;

export default {
  LeftSubTitle,
  ContentContainer,
  ContentHeading,
  SubContent
};
