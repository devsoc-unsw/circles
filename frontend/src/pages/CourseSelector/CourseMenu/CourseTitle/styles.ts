import Button from 'antd/lib/button';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeselectButton = styled(Button)`
  border: none !important;
  background-color: #fafafa !important;
  box-shadow: none !important;
`;

const IconsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`;

const CourseTitleWrapper = styled.div<{ selected: boolean, locked: boolean }>`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  font-size: 0.8rem;

  font-weight: ${({ selected, locked }) => {
    if (locked) return '100';
    if (selected) return '700';
    return 'normal';
  }};

`;

export default {
  Wrapper, DeselectButton, IconsWrapper, CourseTitleWrapper,
};
