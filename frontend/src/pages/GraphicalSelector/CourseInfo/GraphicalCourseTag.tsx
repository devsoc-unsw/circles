import React from 'react';
import { Tag } from 'antd';
import styled, { css } from 'styled-components';

type Props = {
  name: string;
};

const TagDiv = styled(Tag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && css`
    background: ${theme.courseTag.backgroundColor};
  `}
`;

const CourseTag = ({ name }: Props) => (
  <TagDiv className="text">
    {name}
  </TagDiv>
);

export default CourseTag;
