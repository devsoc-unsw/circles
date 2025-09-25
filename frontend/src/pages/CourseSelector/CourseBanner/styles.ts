import styled from 'styled-components';

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.7rem;
  position: relative;
  height: var(--cs-top-cont-height);

  background-color: ${({ theme }) => theme.purpleLight};

  @media (max-width: 768px) {
    width: 100%;
    height: 760px;
  }
`;

export default { BannerWrapper };
