import { Button as antdButton } from 'antd';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5em;
  width: 180px;
`;

const Button = styled(antdButton)`
  width: 150px;
  background-color: ${({ theme }) => theme.optionsHeader.buttonBackgroundColor};
  color: ${({ theme }) => theme.text};
  border-color: ${({ theme }) => theme.optionsHeader.borderColor};
  &:hover {
    background-color: ${({ theme }) => theme.optionsHeader.buttonHoverAlternativeColor};
  }
`;

export default { Wrapper, Button };
