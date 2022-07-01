import { Button } from "antd";
import styled from "styled-components";

const InTPCourseButton = styled(Button)`
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 271px;
  height: 80px;
  white-space: normal;
`;

const NotInTPCourseButton = styled(InTPCourseButton)`
  background: #FFF; 
  && {
    color: #9254de;

  }

  &:hover {
    background-color: #F9F9F9;
  }
`;

export default { InTPCourseButton, NotInTPCourseButton };
