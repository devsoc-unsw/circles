import styled from 'styled-components';

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: calc(var(--cs-top-cont-height) * 4 / 5);
  padding: 3.6rem 1.7rem;
  background-color: ${({ theme }) => theme.purpleLight};
`;

export default { BannerWrapper };
