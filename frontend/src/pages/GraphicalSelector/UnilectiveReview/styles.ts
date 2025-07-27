import styled from 'styled-components';

export const Container = styled.div`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

export const RatingSection = styled.div`
  margin-bottom: 2rem;
`;

export const RatingWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1.5rem 0;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const DialWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const DialLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

export const OverallRating = styled.div`
  text-align: center;
  margin-top: 1.5rem;

  p {
    margin: 0.5rem 0;
    color: ${({ theme }) => theme.text};
  }

  .review-count {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text};
    opacity: 0.7;
  }
`;

export const LinkSection = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.purpleLight};
`;

export const Link = styled.a`
  color: ${({ theme }) => theme.purplePrimary};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.purpleDark};
    text-decoration: underline;
  }
`;

export default {
  Container,
  RatingSection,
  RatingWrapper,
  DialWrapper,
  DialLabel,
  OverallRating,
  LinkSection,
  Link
};
