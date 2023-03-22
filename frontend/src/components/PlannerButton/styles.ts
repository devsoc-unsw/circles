import { Button as antdButton } from 'antd';
import styled from 'styled-components';

const Button = styled(antdButton)`
  background-color: ${({ theme }) => theme.optionsHeader.buttonBackgroundColor};
  color: ${({ theme }) => theme.text};
  border-color: ${({ theme }) => theme.optionsHeader.borderAlternativeColor};
  &:hover {
    background-color: ${({ theme }) => theme.optionsHeader.buttonHoverAlternativeColor};
  }
`;

export default { Button };
