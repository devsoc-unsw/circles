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

export default { ContainerWrapper, ContentWrapper };
