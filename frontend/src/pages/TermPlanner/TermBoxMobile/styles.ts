import { Button as AntButton } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.degreeCard?.backgroundColor || '#f5f5f5'};
  border-radius: 8px;
`;

export const YearTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

export const TermLabel = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

export const TermUOC = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
`;

export const NavigationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

export const NavButton = styled(AntButton)`
  flex: 1;
`;

export const ProgressIndicator = styled.div`
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.5;
`;

export const QuickJumpWrapper = styled.div`
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.draggableTab?.backgroundColor || '#fafafa'};
  border-radius: 8px;
`;

export const QuickJumpTitle = styled.div`
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

export const QuickJumpButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TermUnplannedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

export const MobileUnplannedWrapper = styled.div`
  width: 100%;

  // Override the absolute positioning from UnplannedBox
  ul {
    position: relative !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    height: auto !important;
    max-height: 40vh !important;
    margin: 0 !important;
    padding: 1.2em !important;
    border-radius: 2em !important;

    // Ensure proper overflow behavior
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
`;
