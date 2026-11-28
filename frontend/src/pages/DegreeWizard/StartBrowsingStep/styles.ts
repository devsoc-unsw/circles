import styled from 'styled-components';

const StartBrowsingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  container-type: inline-size;
`;

// The block sits on the right with the other controls, but its text reads
// left to right so the label wraps under itself, not under the checkbox.
const ShareDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 420px;
  text-align: left;

  @container (max-width: 480px) {
    max-width: none;
  }
`;

// Line the hint up with the label text: 16px box + 8px gap in antd's checkbox.
const ShareDataHint = styled.span`
  padding-left: 24px;
  font-size: 0.8rem;
  opacity: 0.7;
`;

export default { StartBrowsingWrapper, ShareDataWrapper, ShareDataHint };
