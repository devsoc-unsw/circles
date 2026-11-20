import styled from 'styled-components';

const StartBrowsingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

const ShareDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  max-width: 420px;
  text-align: right;
`;

const ShareDataHint = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
`;

export default { StartBrowsingWrapper, ShareDataWrapper, ShareDataHint };
