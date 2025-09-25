import styled from 'styled-components';

const PrereqTreeContainer = styled.div<{ $height: number }>`
  margin-top: 1.25rem;
  height: ${({ $height }) => $height}em;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default { PrereqTreeContainer };
