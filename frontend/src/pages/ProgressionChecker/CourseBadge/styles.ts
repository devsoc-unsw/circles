import styled from 'styled-components';

const CourseBadgeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #722ed1;
  color: #fff;
  font-weight: normal;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  box-shadow: 0 0 0 1px #fff;
  cursor: pointer;
`;

const UOCBadgeWrapper = styled.div`
  position: absolute;
  bottom: -5px;
  right: -10px;
`;

export default { CourseBadgeIcon, UOCBadgeWrapper };
