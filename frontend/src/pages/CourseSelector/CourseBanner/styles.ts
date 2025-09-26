import styled from 'styled-components';

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: calc(var(--cs-top-cont-height) * 4 / 5);
  padding: 3.6rem 1.7rem;
  background-color: ${({ theme }) => theme.purpleLight};

  @media (max-width: 768px) {
    width: 100%;
    height: 760px;
  }
`;

export default { BannerWrapper };
