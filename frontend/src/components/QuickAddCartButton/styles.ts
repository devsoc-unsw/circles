import { Button } from 'antd';
import styled from 'styled-components';

const SelectButton = styled(Button)`
  background-color: ${({ theme }) => theme.quickAddRemoveBtn.addBackgroundColor} !important;
  border-color: ${({ theme }) => theme.quickAddRemoveBtn.addBorderColor} !important;
`;

const DeselectButton = styled(Button)`
  border: none !important;
  background-color: ${({ theme }) => theme.quickAddRemoveBtn.removeBackgroundColor} !important;
  box-shadow: none !important;
`;

export default { SelectButton, DeselectButton };
