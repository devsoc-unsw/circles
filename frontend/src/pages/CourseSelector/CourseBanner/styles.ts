import styled from 'styled-components';

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.7rem;
  position: relative;
  height: var(--cs-top-cont-height);

  background-color: ${({ theme }) => theme.purpleLight};
`;

export default { BannerWrapper };
