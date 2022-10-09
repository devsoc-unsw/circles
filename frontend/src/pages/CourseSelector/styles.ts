import styled from 'styled-components';

const ContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 20vw auto;
  height: var(--cs-bottom-cont-height);
`;

const InfographicContainer = styled.div`
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.2s;
  -webkit-animation: fadeIn 0.2s;
  -moz-animation: fadeIn 0.2s;
  -o-animation: fadeIn 0.2s;
  -ms-animation: fadeIn 0.2s;

  & img {
    width: 70%;
    height: 70%;
    max-height: 500px;
  }
`;

export default { ContainerWrapper, ContentWrapper, InfographicContainer };
