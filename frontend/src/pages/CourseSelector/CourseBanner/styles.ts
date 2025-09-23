import styled from 'styled-components';

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: var(--cs-top-cont-height);
  padding: 3rem 1.7rem 3rem;
  background-color: ${({ theme }) => theme.purpleLight};
`;

export default { BannerWrapper };
