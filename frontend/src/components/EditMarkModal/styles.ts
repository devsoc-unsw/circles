import { Button as antdButton, Input as antdInput } from 'antd';
import styled from 'styled-components';

const EditMarkWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LetterGradeWrapper = styled.div`
  display: flex;
  margin-top: 0.4em;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const Input = styled(antdInput)`
  width: 100%;
  background-color: ${({ theme }) => theme.editMark.backgroundColor};
  color: ${({ theme }) => theme.editMark.color};
  border-color: ${({ theme }) => theme.editMark.borderColor};
`;

const Button = styled(antdButton)`
  background-color: ${({ theme }) => theme.editMark.backgroundColor};
  color: ${({ theme }) => theme.editMark.color};
  border-color: ${({ theme }) => theme.editMark.borderColor};
  &:hover {
    background-color: ${({ theme }) => theme.editMark.backgroundColor};
  }
`;

export default { EditMarkWrapper, LetterGradeWrapper, Input, Button };
