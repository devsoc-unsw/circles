import styled from 'styled-components';

const Title = styled.h1`
  font-size: 50px;
  margin-bottom: 3rem;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 1.5rem;
  }
`;

const ContentWrapper = styled.div`
  text-align: center;
  font-size: 1rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 0 0.5rem;
    font-size: 0.9rem;
  }
`;

const LinksWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 100px;
  margin-top: 40px;
  margin-bottom: 100px;

  @media (max-width: 768px) {
    gap: 50px;
    margin-top: 30px;
    margin-bottom: 60px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    margin-top: 1.25rem;
    margin-bottom: 40px;
  }
`;

export default {
  Title,
  ContentWrapper,
  LinksWrapper
};
