import styled from 'styled-components';

export const Wrapper = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

export const VersionCard = styled.div<{ theme?: { border?: string } }>`
  border: 1px solid ${({ theme }) => (theme && theme.border ? theme.border : '#ccc')};
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
`;

export const Header = styled.button`
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
`;

interface FlairTheme {
  textSecondary?: string;
}

export const Flair = styled.span<{ theme?: FlairTheme }>`
  margin-left: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme?.textSecondary ?? '#666'};
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
`;

export const List = styled.ul`
  list-style-type: disc;
  margin-left: 1.5rem;
`;

export const SubList = styled.ul`
  list-style-type: circle;
  margin-left: 1.5rem;
`;

const S = {
  Wrapper,
  Title,
  VersionCard,
  Header,
  Flair,
  SectionTitle,
  List,
  SubList
};

export default S;
